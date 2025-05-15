from image_processor.utils import get_page_images_from_pdf
from api.services.instances import temp_file_service


def test_pdf_to_image():
    pdf_path = "tests/assets/impact_of_llms.pdf"
    temp_dir = temp_file_service.create_temp_dir()
    print(temp_dir)
    get_page_images_from_pdf(pdf_path, temp_dir)
