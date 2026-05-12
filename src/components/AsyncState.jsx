import { useTranslation } from 'react-i18next';

export default function AsyncState({
  loading = false,
  empty = false,
  loadingText,
  emptyTitle,
  emptyDescription = '',
}) {
  const { t } = useTranslation();
  const lt = loadingText ?? t('asyncState.loading');
  const et = emptyTitle ?? t('asyncState.emptyTitle');
  if (loading) {
    return (
      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-12 text-center">
        <p className="font-bold text-gray-700">{lt}</p>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="card-hover bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-12 text-center">
        <p className="font-bold text-gray-700">{et}</p>
        {emptyDescription ? <p className="text-gray-400 text-sm mt-1">{emptyDescription}</p> : null}
      </div>
    );
  }

  return null;
}
