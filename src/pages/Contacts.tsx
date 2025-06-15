
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedLayout } from "@/components/layout/UnifiedLayout";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Search, Send, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Contacts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "" });

  // Mock contacts data
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      avatar: "JD",
      lastSent: "2 days ago"
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah@example.com",
      avatar: "SS",
      lastSent: "1 week ago"
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      avatar: "MJ",
      lastSent: "Never"
    }
  ]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast.error("Please fill in all fields");
      return;
    }

    const contact = {
      id: Date.now(),
      name: newContact.name,
      email: newContact.email,
      avatar: newContact.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      lastSent: "Never"
    };

    setContacts([...contacts, contact]);
    setNewContact({ name: "", email: "" });
    setShowAddContact(false);
    toast.success("Contact added successfully!");
  };

  const handleSendMoney = (contact: any) => {
    navigate('/payments', { state: { selectedContact: contact } });
  };

  const handleDeleteContact = (id: number) => {
    setContacts(contacts.filter(c => c.id !== id));
    toast.success("Contact deleted");
  };

  return (
    <UnifiedLayout 
      showBackButton 
      onBack={() => navigate('/dashboard')}
      title="Contacts"
      subtitle="Manage your payment recipients"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Search and Add Section */}
          <Card className="glass-card modern-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="modern-input pl-10"
                  />
                </div>
                <Button 
                  onClick={() => setShowAddContact(true)}
                  className="premium-button"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Add Contact Form */}
          {showAddContact && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card modern-shadow border-blue-500/25">
                <CardHeader>
                  <CardTitle className="text-white">Add New Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Full Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="modern-input"
                  />
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    className="modern-input"
                  />
                  <div className="flex gap-3">
                    <Button onClick={handleAddContact} className="premium-button flex-1">
                      Add Contact
                    </Button>
                    <Button 
                      onClick={() => setShowAddContact(false)}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Contacts List */}
          <Card className="glass-card modern-shadow">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                Your Contacts ({filteredContacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/60">
                    {searchTerm ? "No contacts found" : "No contacts yet"}
                  </p>
                  <p className="text-white/40 text-sm">
                    {searchTerm ? "Try a different search term" : "Add your first contact to get started"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredContacts.map((contact, index) => (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:bg-white/5 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {contact.avatar}
                              </div>
                              <div>
                                <p className="font-medium text-white">{contact.name}</p>
                                <p className="text-sm text-white/60">{contact.email}</p>
                                <p className="text-xs text-white/40">Last sent: {contact.lastSent}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleSendMoney(contact)}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30"
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteContact(contact.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </UnifiedLayout>
  );
};

export default Contacts;
