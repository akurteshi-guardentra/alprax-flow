import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  ArrowLeft, 
  Send, 
  Wallet, 
  Globe, 
  TestTube,
  UserCheck,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserSwitcher } from '@/components/testing/UserSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';

export default function MultiUserTesting() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const testScenarios = [
    {
      title: 'Basic Money Transfer',
      description: 'Send €100 from Alice (Austria) to Bob (Kosovo)',
      steps: [
        'Login as Alice',
        'Go to Send Money',
        'Select Bob as recipient',
        'Enter €100 amount',
        'Complete transfer'
      ],
      difficulty: 'Easy'
    },
    {
      title: 'Cross-Border Business',
      description: 'Send €500 from David (Switzerland) to Carol (Albania)',
      steps: [
        'Login as David',
        'Send €500 to Carol',
        'Login as Carol',
        'Check received amount',
        'Verify transaction'
      ],
      difficulty: 'Medium'
    },
    {
      title: 'Multi-Recipient Testing',
      description: 'Test sending to multiple recipients',
      steps: [
        'Login as Alice',
        'Send to Bob and Carol',
        'Switch between recipients',
        'Verify all received funds',
        'Check transaction history'
      ],
      difficulty: 'Advanced'
    }
  ];

  const features = [
    {
      icon: UserCheck,
      title: 'Multi-User Login',
      description: 'Switch between different test users instantly'
    },
    {
      icon: Globe,
      title: 'Cross-Border Testing',
      description: 'Test Austria→Kosovo, Switzerland→Albania corridors'
    },
    {
      icon: Send,
      title: 'Real Transaction Flow',
      description: 'Full end-to-end payment testing'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'See payments arrive in real-time'
    }
  ];

  return (
    <div className={`min-h-screen mobile-viewport ${isMobile ? 'mobile-nav-spacing' : ''}`}>
      <div className="mobile-container pt-safe">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10 touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="mobile-title text-white">Multi-User Testing</h1>
            <p className="mobile-subtitle text-white/70">Test the complete remittance experience</p>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-mobile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TestTube className="w-5 h-5" />
                  Testing Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <feature.icon className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <div className="font-medium text-white text-sm">{feature.title}</div>
                        <div className="text-xs text-white/60">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Switcher Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UserSwitcher />
          </motion.div>

          {/* Test Scenarios */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-mobile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ArrowUpRight className="w-5 h-5" />
                  Recommended Test Scenarios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testScenarios.map((scenario, index) => (
                    <div key={index} className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-medium text-white">{scenario.title}</div>
                        <Badge 
                          variant={scenario.difficulty === 'Easy' ? 'default' : 
                                   scenario.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                        >
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70 mb-3">{scenario.description}</p>
                      <div className="space-y-1">
                        {scenario.steps.map((step, stepIndex) => (
                          <div key={stepIndex} className="flex items-center gap-2 text-xs text-white/60">
                            <span className="w-4 h-4 bg-white/10 rounded-full flex items-center justify-center text-[10px]">
                              {stepIndex + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-mobile">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => navigate('/payments')}
                    className="btn-mobile-primary"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Money
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard')}
                    variant="outline"
                    className="border-white/20 bg-transparent hover:bg-white/10 text-white"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Check Balance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-white/50 bg-white/5 p-4 rounded-lg border border-white/10"
          >
            <strong>Development Note:</strong> This testing interface simulates the complete remittance experience. 
            In production, users would have their own accounts and wouldn't be able to switch between users. 
            This tool helps demonstrate the full sender→receiver flow for stakeholders and investors.
          </motion.div>
        </div>
      </div>
    </div>
  );
}