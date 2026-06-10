import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Download } from 'lucide-react';
import { useImportOrders } from '../api/orders';
import { Button } from '../components/ui/Button';

const SAMPLE_CSV = `orderNumber,supplierEmail,partDescription,dueDate,quantity,unit
PO-2024-001,lieferant@mueller.de,Hydraulikzylinder 50mm,2024-12-15,10,Stück`;

export function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const importMutation = useImportOrders();
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; message: string }> } | null>(null);

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
      <h1 className="text-xl font-bold">Bestellungen importieren</h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <p className="text-gray-600 text-sm">
          Laden Sie eine CSV-Datei mit Ihren offenen Bestellungen hoch. Lieferanten werden automatisch angelegt, falls sie noch nicht existieren.
        </p>

        <Button variant="secondary" size="sm" onClick={downloadSample}>
          <Download className="w-4 h-4 mr-2" />
          CSV-Vorlage herunterladen
        </Button>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
          {importMutation.isPending ? 'Importiere...' : 'Import starten'}
        </Button>

        {result && (
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-green-700">{result.imported} Bestellungen importiert</p>
            {result.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-risk-red font-medium">{result.errors.length} Fehler:</p>
                <ul className="mt-1 space-y-1">
                  {result.errors.map((e) => (
                    <li key={e.row} className="text-gray-600">Zeile {e.row}: {e.message}</li>
                  ))}
                </ul>
              </div>
            )}
            <Link to="/dashboard" className="text-brand-600 hover:underline mt-3 inline-block">
              Zum Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
