"""
項目管理相關的 API 端點
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.dependencies import get_current_user
from app.models.schemas import Item, ItemCreate, ItemBase
from app.database.fake_db import get_fake_db, add_item_to_db, get_next_item_id

router = APIRouter()


@router.post("/", response_model=Item)
async def create_item(
    item_data: ItemCreate, 
    current_user: dict = Depends(get_current_user)
):
    """建立新項目"""
    new_item = Item(
        id=get_next_item_id(),
        name=item_data.name,
        description=item_data.description
    )
    return add_item_to_db(new_item)


@router.get("/", response_model=List[Item])
async def get_items(current_user: dict = Depends(get_current_user)):
    """取得所有項目"""
    return get_fake_db()


@router.get("/{item_id}", response_model=Item)
async def get_item(
    item_id: int, 
    current_user: dict = Depends(get_current_user)
):
    """取得特定項目"""
    items = get_fake_db()
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )


@router.put("/{item_id}", response_model=Item)
async def update_item(
    item_id: int,
    item_data: ItemBase,
    current_user: dict = Depends(get_current_user)
):
    """更新項目"""
    items = get_fake_db()
    for item in items:
        if item.id == item_id:
            item.name = item_data.name
            item.description = item_data.description
            return item
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )


@router.delete("/{item_id}")
async def delete_item(
    item_id: int,
    current_user: dict = Depends(get_current_user)
):
    """刪除項目"""
    items = get_fake_db()
    for i, item in enumerate(items):
        if item.id == item_id:
            del items[i]
            return {"message": "Item deleted successfully"}
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Item not found"
    )
