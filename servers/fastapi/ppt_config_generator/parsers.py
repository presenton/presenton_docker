from langchain.schema import BaseOutputParser


class StripMarkdownOutputParser(BaseOutputParser):
    def parse(self, text: str) -> str:
        # Remove triple backticks and any optional language hint like ```markdown
        import re

        return re.sub(r"^```[\w]*\n?|```$", "", text.strip(), flags=re.MULTILINE)
