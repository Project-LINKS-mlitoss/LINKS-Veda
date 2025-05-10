# external imports
from typing import Literal
import sys
import os
from pathlib import Path
# internal imports

# define the constants
FILE_EXTENSIONS = Literal[
    "pdf", "jpeg", "png", "bmp", "tiff", "heif", "docx", "xlsx", "pptx", "html"
]

SOURCE_TYPES = Literal["file", "url"]