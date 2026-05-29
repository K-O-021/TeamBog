// ContentModeration.ts
// Handles content review, moderation, and compliance

export interface ModerationItem {
  id: string;
  type: 'POST' | 'DOCUMENT' | 'COMMENT';
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reason?: string;
}

export class ContentModeration {
  private items: ModerationItem[] = [];

  submitItem(item: Omit<ModerationItem, 'status' | 'reviewedBy' | 'reviewedAt' | 'reason'>): ModerationItem {
    const newItem: ModerationItem = {
      ...item,
      status: 'PENDING',
    };
    this.items.push(newItem);
    return newItem;
  }

  reviewItem(id: string, approved: boolean, reviewedBy: string, reason?: string): ModerationItem | null {
    const item = this.items.find(i => i.id === id);
    if (!item) return null;
    item.status = approved ? 'APPROVED' : 'REJECTED';
    item.reviewedBy = reviewedBy;
    item.reviewedAt = new Date();
    item.reason = reason;
    return item;
  }

  getPendingItems(): ModerationItem[] {
    return this.items.filter(i => i.status === 'PENDING');
  }

  getAllItems(): ModerationItem[] {
    return this.items;
  }
}
