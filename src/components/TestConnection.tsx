
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const TestConnection: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const testConnection = async () => {
    setTesting(true);
    setResults([]);
    
    try {
      // Teste 1: Verificar autenticação
      console.log('Testando autenticação...');
      const { data: authData, error: authError } = await supabase.auth.getUser();
      setResults(prev => [...prev, {
        test: 'Autenticação',
        status: authError ? 'Erro' : 'Sucesso',
        details: authError ? authError.message : `Usuário: ${authData.user?.email}`
      }]);

      // Teste 2: Conexão básica com Supabase
      console.log('Testando conexão básica...');
      const { data: healthData, error: healthError } = await supabase
        .from('reservations')
        .select('count')
        .limit(1);
      
      setResults(prev => [...prev, {
        test: 'Conexão com banco',
        status: healthError ? 'Erro' : 'Sucesso',
        details: healthError ? healthError.message : 'Conexão estabelecida'
      }]);

      // Teste 3: Buscar reservas
      console.log('Testando busca de reservas...');
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .limit(5);
      
      setResults(prev => [...prev, {
        test: 'Busca de reservas',
        status: reservationsError ? 'Erro' : 'Sucesso',
        details: reservationsError ? reservationsError.message : `${reservationsData?.length || 0} reservas encontradas`
      }]);

      // Teste 4: Verificar estrutura da tabela
      console.log('Verificando estrutura da tabela...');
      const { data: tableData, error: tableError } = await supabase
        .from('reservations')
        .select('*')
        .limit(1);
      
      setResults(prev => [...prev, {
        test: 'Estrutura da tabela',
        status: tableError ? 'Erro' : 'Sucesso',
        details: tableError ? tableError.message : `Colunas: ${tableData && tableData.length > 0 ? Object.keys(tableData[0]).join(', ') : 'Tabela vazia'}`
      }]);

    } catch (error) {
      console.error('Erro no teste de conexão:', error);
      toast({
        title: 'Erro no teste',
        description: 'Erro inesperado durante o teste de conexão.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teste de Conexão com Banco</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing}>
          {testing ? 'Testando...' : 'Testar Conexão'}
        </Button>
        
        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">Resultados:</h3>
            {results.map((result, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{result.test}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    result.status === 'Sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{result.details}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestConnection;
