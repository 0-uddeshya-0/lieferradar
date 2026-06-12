import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download } from 'lucide-react';
import { useImportOrders } from '../api/orders';
import { Button } from '../components/ui/Button';
import { useI18n } from '../i18n';

const SAMPLE_CSV = `orderNumber,supplierEmail,partDescription,dueDate,quantity,unit,value
PO-2026-001,lieferant@mueller.de,Hydraulikzylinder 50mm,2026-09-15,10,Stück,18500.00`;

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const importMutation = useImportOrders();
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const { t } = useI18n();

  const handleImport = async () => {
    if (!file) return;
    const res = await importMutation.mutateAsync(file);
    setResult(res);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bestellungen-vorlage.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">{t('import.title')}</h1>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <p className="text-gray-600 text-sm">{t('import.desc')}</p>

        <Button variant="secondary" size="sm" onClick={downloadSample}>
          <Download className="w-4 h-4 mr-2" />
          {t('import.template')}
        </Button>

        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand-300 transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          {file && <p className="text-sm text-gray-600 mt-2">{file.name}</p>}
        </div>

        <Button onClick={handleImport} disabled={!file || importMutation.isPending}>
          {importMutation.isPending ? t('import.running') : t('import.start')}
        </Button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-green-700">{result.imported} {t('import.imported')}</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-risk-red font-medium">{result.errors.length} {t('import.errors')}</p>
                <ul className="mt-1 space-y-1">
                  {result.errors.map((e) => (
                    <li key={e.row} className="text-gray-600">{t('import.row')} {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="/dashboard" className="text-brand-600 hover:underline mt-3 inline-block">
              {t('import.toDashboard')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
