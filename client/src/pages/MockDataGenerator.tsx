import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Key, Mail, Lock, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/contexts/AuthContext';

export default function MockDataGenerator() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [generatedData, setGeneratedData] = useState({
    apiKey: '',
    token: '',
    email: '',
    bcryptHash: ''
  });
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user || user.role !== 'super-admin') {
    return <div>Access denied. Super admin privileges required.</div>;
  }

  const generateApiKey = () => {
    // Format: TEST-{10 digits}-{6 digits}-{32 hex chars}-{9 digits}
    const timestamp = Date.now().toString().slice(-10);
    const random6 = Math.floor(100000 + Math.random() * 900000);
    const hex32 = Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const random9 = Math.floor(100000000 + Math.random() * 900000000);
    
    return `TEST-${timestamp}-${random6}-${hex32}-${random9}`;
  };

  const generateToken = () => {
    // Format: {8-4-4-4-12 UUID}-{64 hex chars}
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    const hex64 = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    return `${uuid}${hex64}`;
  };

  const generateEmail = () => {
    const domains = ['entrepreneur.com.br', 'business.com.br', 'company.com.br'];
    const prefixes = ['customer', 'client', 'user', 'test', 'demo'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    
    return `${randomPrefix}${randomNumber}@${randomDomain}`;
  };

  const generateBcryptHash = async (plainPassword: string) => {
    try {
      const response = await fetch('/api/utils/bcrypt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: plainPassword })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate bcrypt hash');
      }
      
      const data = await response.json();
      return data.hash;
    } catch (error) {
      // Fallback to client-side simulation (not real bcrypt)
      const saltRounds = 10;
      const salt = '$2b$' + saltRounds.toString().padStart(2, '0') + '$';
      const randomHash = Array.from({length: 53}, () => 
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'
        [Math.floor(Math.random() * 64)]
      ).join('');
      
      return salt + randomHash;
    }
  };

  const generateAllData = async () => {
    const newData = {
      apiKey: generateApiKey(),
      token: generateToken(),
      email: generateEmail(),
      bcryptHash: password ? await generateBcryptHash(password) : ''
    };
    
    setGeneratedData(newData);
    
    toast({
      title: 'Mock Data Generated',
      description: 'All mock data has been generated successfully'
    });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied!',
        description: `${type} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col lg:ml-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Mock Data Generator
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Generate realistic test data for development and testing
              </p>
            </div>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
              Super Admin Only
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generator Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5" />
                  <span>Data Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password (for bcrypt generation)</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password to hash"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button 
                  onClick={generateAllData} 
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate All Mock Data
                </Button>
              </CardContent>
            </Card>

            {/* Generated Data Display */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* API Key */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span>API Key</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Textarea
                      value={generatedData.apiKey}
                      readOnly
                      className="text-xs font-mono"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedData.apiKey, 'API Key')}
                      disabled={!generatedData.apiKey}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Token */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span>Token</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Textarea
                      value={generatedData.token}
                      readOnly
                      className="text-xs font-mono"
                      rows={3}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedData.token, 'Token')}
                      disabled={!generatedData.token}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={generatedData.email}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedData.email, 'Email')}
                      disabled={!generatedData.email}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bcrypt Hash */}
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Bcrypt Hash</span>
                  </Label>
                  <div className="flex space-x-2">
                    <Textarea
                      value={generatedData.bcryptHash}
                      readOnly
                      className="text-xs font-mono"
                      rows={2}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedData.bcryptHash, 'Bcrypt Hash')}
                      disabled={!generatedData.bcryptHash}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Format Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">API Key Format:</h4>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                    TEST-1972063865-060809-84062473719b4e555ac174f4313b2757-182357632
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Token Format:</h4>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                    a4003a95-9d6b-476d-8c4b-4d30983324680087d4f74051a2e351160432580c0e9d2ff3
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Email Format:</h4>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                    customer123@entrepreneur.com.br
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Bcrypt Format:</h4>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                    $2b$10$N9qo8uLOickgx2ZMRZoMye...
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </main>
      </div>
    </div>
  );
}