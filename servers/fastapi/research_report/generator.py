import os
from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

# search_tool = DuckDuckGoSearchRun(
#     api_wrapper=DuckDuckGoSearchAPIWrapper(max_results=50)
# )

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Use provided prompt and search results to create an elaborate and up-to-date research report in mentioned language.

            # Steps
            1. Analyze the prompt and search results.
            2. Extract topic of the report.
            3. Generate a report in markdown format.

            # Notes
            - If language is not mentioned, use language from prompt.
            - Format of report should be like *Research Report*.
            - Ignore formatting if mentioned in prompt.
            """,
        ),
        (
            "human",
            """
            - Prompt: {prompt}
            - Language: {language}
            - Search Results: {search_results}
            """,
        ),
    ]
)


async def get_report(query: str, language: Optional[str]):
    model = (
        ChatOpenAI(model="gpt-4.1-nano")
        if os.getenv("LLM") == "openai"
        else ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    )
    chain = prompt_template | model

    # search_results = await search_tool.ainvoke(query)
    # response = await chain.ainvoke(
    #     {
    #         "prompt": query,
    #         "language": language,
    #         "search_results": search_results,
    #     }
    # )
    # return response.content
    return "Research Report coming soon"
