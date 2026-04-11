export default function CompatibilityScore({ score }) {
  const getColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMessage = () => {
    if (score >= 80) return 'Excellent match !';
    if (score >= 60) return 'Bon match';
    if (score >= 40) return 'Match potentiel';
    return 'Compatibilité limitée';
  };

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 mb-2">
        <span className={`text-3xl font-bold ${getColor()}`}>{score}%</span>
      </div>
      <p className="font-medium text-gray-900">{getMessage()}</p>
      <p className="text-xs text-gray-500">Score de compatibilité</p>
    </div>
  );
}