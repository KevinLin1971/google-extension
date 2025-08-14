"""
模擬資料庫
"""
from typing import List
from app.models.schemas import Item

# 內存資料庫
fake_items_db: List[Item] = []


def get_fake_db() -> List[Item]:
    """取得模擬資料庫"""
    return fake_items_db


def add_item_to_db(item: Item) -> Item:
    """新增項目到模擬資料庫"""
    fake_items_db.append(item)
    return item


def get_next_item_id() -> int:
    """取得下一個項目ID"""
    if not fake_items_db:
        return 1
    return max(item.id for item in fake_items_db) + 1
