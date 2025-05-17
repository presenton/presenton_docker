import os
from urllib.parse import unquote, urlparse
import uuid
from api.utils import download_files, replace_file_name
from ppt_generator.models.pptx_models import PptxPictureBoxModel


class FetchPresentationAssetsMixin:

    async def fetch_presentation_assets(self):
        image_urls = []
        image_local_paths = []

        for each_slide in self.data.pptx_model.slides:
            for each_shape in each_slide.shapes:
                if isinstance(each_shape, PptxPictureBoxModel):
                    image_path = each_shape.picture.path
                    if image_path.startswith("http"):
                        image_urls.append(image_path)
                        parsed_url = unquote(urlparse(image_path).path)
                        image_name = replace_file_name(
                            os.path.basename(parsed_url), str(uuid.uuid4())
                        )
                        image_path = os.path.join(self.temp_dir, image_name)
                        image_local_paths.append(image_path)
                    elif image_path.startswith("file://"):
                        image_path = image_path.replace("file:///", "")
                        # Check if it's a Windows path (has colon at index 1)
                        if not (len(image_path) > 1 and image_path[1] == ':'):
                            image_path = '/' + image_path

                    each_shape.picture.path = image_path
                    each_shape.picture.is_network = False

        await download_files(image_urls, image_local_paths)
