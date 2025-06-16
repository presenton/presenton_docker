from image_processor.utils import get_page_images_from_pdf
from api.services.instances import TEMP_FILE_SERVICE


def test_pdf_to_image():
    pdf_path = "tests/assets/impact_of_llms.pdf"
    temp_dir = TEMP_FILE_SERVICE.create_temp_dir()
    print(temp_dir)
    get_page_images_from_pdf(pdf_path, temp_dir)
