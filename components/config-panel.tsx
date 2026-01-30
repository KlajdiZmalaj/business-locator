"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Eye, EyeOff, Server, Key, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export function ConfigPanel() {
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  const [smtp, setSmtp] = useState({
    host: "",
    port: "",
    user: "",
    pass: "",
  });

  const [smsApiKey, setSmsApiKey] = useState("");
  const [skrrapiApiKey, setSkrrapiApiKey] = useState("");

  const toggleVisibility = (field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveSmtp = () => {
    toast.success("SMTP configuration saved");
  };

  const handleSaveSms = () => {
    toast.success("SMS API key saved");
  };

  const handleSaveSkrrapi = () => {
    toast.success("Skrrapi API key saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Manage your API keys and mail server settings.
        </p>
      </div>

      {/* SMTP Mail Server */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>SMTP Mail Server</CardTitle>
          </div>
          <CardDescription>
            Configure your custom SMTP server for sending emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">Host</Label>
              <Input
                id="smtp-host"
                placeholder="smtp.example.com"
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Port</Label>
              <Input
                id="smtp-port"
                placeholder="587"
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">Username</Label>
              <Input
                id="smtp-user"
                placeholder="user@example.com"
                value={smtp.user}
                onChange={(e) => setSmtp({ ...smtp, user: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">Password</Label>
              <div className="relative">
                <Input
                  id="smtp-pass"
                  type={showPasswords["smtp-pass"] ? "text" : "password"}
                  placeholder="••••••••"
                  value={smtp.pass}
                  onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility("smtp-pass")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords["smtp-pass"] ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <Button onClick={handleSaveSmtp} className="mt-6">
            <Save className="h-4 w-4 mr-2" />
            Save SMTP Settings
          </Button>
        </CardContent>
      </Card>

      {/* SMS API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle>SMS API Key</CardTitle>
          </div>
          <CardDescription>
            Enter your SMS API key to enable sending text messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="sms-key">API Key</Label>
            <div className="relative">
              <Input
                id="sms-key"
                type={showPasswords["sms-key"] ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility("sms-key")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords["sms-key"] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button onClick={handleSaveSms} className="mt-6">
            <Save className="h-4 w-4 mr-2" />
            Save SMS API Key
          </Button>
        </CardContent>
      </Card>

      {/* Skrrapi API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Skrrapi API Key</CardTitle>
          </div>
          <CardDescription>
            Enter your Skrrapi API key to enable the business scraper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md">
            <Label htmlFor="skrrapi-key">API Key</Label>
            <div className="relative">
              <Input
                id="skrrapi-key"
                type={showPasswords["skrrapi-key"] ? "text" : "password"}
                placeholder="••••••••••••••••"
                value={skrrapiApiKey}
                onChange={(e) => setSkrrapiApiKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility("skrrapi-key")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords["skrrapi-key"] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <Button onClick={handleSaveSkrrapi} className="mt-6">
            <Save className="h-4 w-4 mr-2" />
            Save Skrrapi API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
