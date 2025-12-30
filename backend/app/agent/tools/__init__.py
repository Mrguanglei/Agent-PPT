from .search_images import search_images
from .web_search import web_search
from .visit_page import visit_page
from .ppt_operations import (
    initialize_design,
    insert_page,
    update_page,
    remove_pages
)
from .think import think

TOOLS_REGISTRY = {
    "search_images": search_images,
    "web_search": web_search,
    "visit_page": visit_page,
    "initialize_design": initialize_design,
    "insert_page": insert_page,
    "update_page": update_page,
    "remove_pages": remove_pages,
    "think": think
}

__all__ = [
    "search_images",
    "web_search",
    "visit_page",
    "initialize_design",
    "insert_page",
    "update_page",
    "remove_pages",
    "think",
    "TOOLS_REGISTRY"
]
