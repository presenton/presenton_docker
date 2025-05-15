import os
from fastapi import HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, ValidationError


def get_prompt_template():
    return ChatPromptTemplate(
        messages=[
            (
                "system",
                """
                Analyze the provided [Input] and [Errors] then provide structured output by fixing the errors.

                # Steps
                1. Go through the provided [Input].
                2. Find mentioned [Errors] in the [Input].
                3. Check provided schema and follow every constraints.
                4. Provide structured output.

                # Notes
                - Only output fields mentioned in the schema.
                - Check if fields' key may have been misnamed in the provided **Input**.
                    - Change fields' name to match the schema.
                """,
            ),
            (
                "user",
                """
                - Input: {input}
                - Errors: {errors} 
                """,
            ),
        ]
    )


async def fix_validation_errors(response_model: BaseModel, response, errors):
    model = (
        ChatOpenAI(model="o3-mini", reasoning_effort="high")
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17")
    )

    chain = get_prompt_template() | model.with_structured_output(
        response_model.model_json_schema()
    )
    return await chain.ainvoke({"input": response, "errors": errors})


async def get_validated_response(
    chain, input_dict, response_model: BaseModel, retries: int = 1
):
    response = await chain.ainvoke(input_dict)

    attempt = 0
    while retries >= attempt:
        attempt += 1
        try:
            if response and type(response) is list:
                response = response[0]["args"]

            validated_response = response_model(**response)
            return validated_response
        except ValidationError as e:
            if retries < attempt:
                break

            error_details = []
            for error in e.errors():
                error_details.append(
                    {
                        "loc": " -> ".join(str(loc) for loc in error["loc"]),
                        "msg": error["msg"],
                        "type": error["type"],
                    }
                )

            print(f"Validation Retry attempt - {attempt}")
            response = await fix_validation_errors(
                response_model, response, error_details
            )

    raise HTTPException(status_code=400, detail="Error while validating response")
