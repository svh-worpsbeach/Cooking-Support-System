import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useShoppingLists } from '../hooks/useShoppingLists';
import type { ShoppingList, ShoppingListItem } from '../types';
import Layout from '../components/common/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ShoppingListDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getShoppingList, toggleItemChecked, deleteShoppingList } = useShoppingLists();
  
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadShoppingList();
  }, [id]);

  const loadShoppingList = async () => {
    if (!id) return;
    setLoading(true);
    const list = await getShoppingList(parseInt(id));
    setShoppingList(list);
    setLoading(false);
  };

  const handleToggleItem = async (itemId: number, currentChecked: number) => {
    if (!id) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    const newChecked = currentChecked === 1 ? 0 : 1;
    const success = await toggleItemChecked(parseInt(id), itemId, newChecked);
    
    if (success && shoppingList) {
      // Update local state
      setShoppingList({
        ...shoppingList,
        items: shoppingList.items?.map(item =>
          item.id === itemId ? { ...item, checked: newChecked } : item
        )
      });
    }
    
    setUpdatingItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleDelete = async () => {
    if (!id || !confirm(t('shoppingLists.confirmDelete'))) return;
    
    const success = await deleteShoppingList(parseInt(id));
    if (success) {
      navigate('/shopping-lists');
    } else {
      alert(t('shoppingLists.deleteError'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupItemsByShop = (items: ShoppingListItem[]) => {
    const grouped: Record<string, ShoppingListItem[]> = {};
    
    items.forEach(item => {
      const shop = item.shop || t('shoppingLists.noShop');
      if (!grouped[shop]) {
        grouped[shop] = [];
      }
      grouped[shop].push(item);
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <Layout>
        <LoadingSpinner />
      </Layout>
    );
  }

  if (!shoppingList) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {t('shoppingLists.notFound')}
          </p>
          <Button onClick={() => navigate('/shopping-lists')} className="mt-4">
            {t('common.back')}
          </Button>
        </div>
      </Layout>
    );
  }

  const items = shoppingList.items || [];
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.checked === 1).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  const groupedItems = groupItemsByShop(items);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/shopping-lists')}
              className="mb-4"
            >
              ← {t('common.back')}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {shoppingList.title}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(shoppingList.due_date)}</span>
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            onClick={handleDelete}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('common.delete')}
          </Button>
        </div>

        {/* Progress Card */}
        <Card>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">{t('shoppingLists.progress')}</span>
              <span>{checkedItems} / {totalItems} {t('shoppingLists.items')}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-green-600 dark:bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
              {Math.round(progress)}%
            </p>
          </div>
        </Card>

        {/* Shopping List Items by Shop */}
        {totalItems === 0 ? (
          <Card>
            <p className="text-center text-gray-600 dark:text-gray-400 py-8">
              {t('shoppingLists.noItems')}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([shop, shopItems]) => (
              <Card key={shop}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                  {shop}
                </h3>
                <div className="space-y-2">
                  {shopItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        item.checked === 1
                          ? 'bg-gray-50 dark:bg-gray-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleItem(item.id, item.checked)}
                        disabled={updatingItems.has(item.id)}
                        className="flex-shrink-0"
                      >
                        {updatingItems.has(item.id) ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                            item.checked === 1
                              ? 'bg-green-600 border-green-600'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-600'
                          }`}>
                            {item.checked === 1 && (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                      </button>
                      <div className="flex-1">
                        <span className={`${
                          item.checked === 1
                            ? 'line-through text-gray-500 dark:text-gray-500'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.name}
                        </span>
                        {(item.amount || item.unit) && (
                          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                            ({item.amount} {item.unit})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShoppingListDetailPage;

// Made with Bob
