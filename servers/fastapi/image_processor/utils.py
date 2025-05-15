import asyncio
import os
from api.services.instances import temp_file_service
import pdfplumber


def get_page_images_from_pdf(document_path: str, temp_dir: str):
    images_temp_dir = temp_file_service.create_dir_in_dir(temp_dir)

    with pdfplumber.open(document_path) as pdf:
        for page in pdf.pages:
            img = page.to_image(resolution=300)
            img.save(os.path.join(images_temp_dir, f"page_{page.page_number}.png"))


async def get_page_images_from_pdf_async(document_path: str, temp_dir: str):
    return await asyncio.to_thread(get_page_images_from_pdf, document_path, temp_dir)
