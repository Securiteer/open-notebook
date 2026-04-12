"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { skillsApi } from "@/lib/api/skills";
import { Skill } from "@/lib/types/skills";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Star, CheckCircle, Trash2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: marketplaceSkills = [], isLoading: isLoadingMarketplace } = useQuery({
    queryKey: ["skills", "marketplace"],
    queryFn: () => skillsApi.getSkills()
  });

  const { data: installedSkills = [], isLoading: isLoadingInstalled } = useQuery({
    queryKey: ["skills", "installed"],
    queryFn: () => skillsApi.getInstalledSkills()
  });

  const installMutation = useMutation({
    mutationFn: (id: string) => skillsApi.installSkill(id),
    onSuccess: () => {
      toast.success("Skill installed successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: () => toast.error("Failed to install skill")
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => skillsApi.uninstallSkill(id),
    onSuccess: () => {
      toast.success("Skill uninstalled successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: () => toast.error("Failed to uninstall skill")
  });

  const rateMutation = useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: number }) => skillsApi.rateSkill(id, { rating }),
    onSuccess: () => {
      toast.success("Rating submitted");
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: () => toast.error("Failed to submit rating")
  });

  const filteredMarketplace = marketplaceSkills.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredInstalled = installedSkills.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsDetailOpen(true);
  };

  const handleRate = (skillId: string, rating: number) => {
    rateMutation.mutate({ id: skillId, rating });
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations & Skills</h1>
          <p className="text-muted-foreground mt-2">
            Discover, install, and manage AI skills for your notebook.
          </p>
        </div>
        <UploadSkillDialog />
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="marketplace" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="installed">Installed ({installedSkills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-6">
          {isLoadingMarketplace ? (
            <div className="flex justify-center p-8">Loading skills...</div>
          ) : filteredMarketplace.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No skills found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarketplace.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onInstall={() => installMutation.mutate(skill.id)}
                  onUninstall={() => uninstallMutation.mutate(skill.id)}
                  onClick={() => handleSkillClick(skill)}
                  installing={installMutation.isPending && installMutation.variables === skill.id}
                  uninstalling={uninstallMutation.isPending && uninstallMutation.variables === skill.id}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installed" className="mt-6">
          {isLoadingInstalled ? (
            <div className="flex justify-center p-8">Loading installed skills...</div>
          ) : filteredInstalled.length === 0 ? (
            <div className="text-center p-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">You do not have any skills installed yet.</p>
              <Button variant="link" onClick={() => document.querySelector('[value="marketplace"]')?.dispatchEvent(new MouseEvent('click'))}>
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstalled.map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onUninstall={() => uninstallMutation.mutate(skill.id)}
                  onClick={() => handleSkillClick(skill)}
                  uninstalling={uninstallMutation.isPending && uninstallMutation.variables === skill.id}
                  isInstalledView
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <SkillDetailDialog
        skill={selectedSkill}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onInstall={(id) => installMutation.mutate(id)}
        onUninstall={(id) => uninstallMutation.mutate(id)}
        onRate={handleRate}
      />
    </div>
  );
}

function SkillCard({
  skill,
  onInstall,
  onUninstall,
  onClick,
  installing,
  uninstalling,
  isInstalledView = false
}: {
  skill: Skill;
  onInstall?: () => void;
  onUninstall: () => void;
  onClick: () => void;
  installing?: boolean;
  uninstalling?: boolean;
  isInstalledView?: boolean;
}) {
  return (
    <Card className="flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="cursor-pointer" onClick={onClick}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl line-clamp-1">{skill.name}</CardTitle>
          {skill.is_installed && !isInstalledView && (
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
              <CheckCircle className="w-3 h-3 mr-1" /> Installed
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center gap-2 mt-1">
          <span>By {skill.author}</span>
          <span>•</span>
          <span className="flex items-center">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
            {skill.rating.toFixed(1)} ({skill.rating_count})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 cursor-pointer" onClick={onClick}>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {skill.description}
        </p>
      </CardContent>
      <CardFooter className="pt-4 border-t gap-2">
        <Button variant="outline" className="flex-1" onClick={onClick}>
          <Info className="w-4 h-4 mr-2" />
          Details
        </Button>
        {skill.is_installed ? (
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onUninstall}
            disabled={uninstalling}
          >
            {uninstalling ? "Removing..." : "Uninstall"}
          </Button>
        ) : onInstall ? (
          <Button
            variant="default"
            className="flex-1"
            onClick={onInstall}
            disabled={installing}
          >
            {installing ? "Installing..." : "Install"}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}

function SkillDetailDialog({
  skill,
  open,
  onOpenChange,
  onInstall,
  onUninstall,
  onRate
}: {
  skill: Skill | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: (id: string) => void;
  onUninstall: (id: string) => void;
  onRate: (id: string, rating: number) => void;
}) {
  if (!skill) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start pr-6">
            <div>
              <DialogTitle className="text-2xl">{skill.name}</DialogTitle>
              <DialogDescription className="mt-2 text-base">
                By {skill.author} • v{skill.version}
              </DialogDescription>
            </div>
            {skill.is_installed && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <CheckCircle className="w-4 h-4 mr-1" /> Installed
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border">
            <div className="flex flex-col items-center border-r pr-6">
              <span className="text-3xl font-bold flex items-center">
                {skill.rating.toFixed(1)} <Star className="w-6 h-6 fill-amber-400 text-amber-400 ml-1" />
              </span>
              <span className="text-xs text-muted-foreground mt-1">{skill.rating_count} ratings</span>
            </div>
            <div className="pl-2">
              <p className="text-sm font-medium mb-2">Rate this skill</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => onRate(skill.id, star)}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-amber-400 hover:fill-amber-400 transition-colors"
                  >
                    <Star className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{skill.description}</p>
          </div>

          {skill.instructions && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Usage Instructions</h3>
              <div className="bg-muted/50 p-4 rounded-md text-sm text-foreground">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {skill.instructions}
                </ReactMarkdown>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-2">Prompt Template</h3>
            <div className="bg-slate-950 text-slate-50 p-4 rounded-md overflow-x-auto">
              <pre className="text-sm"><code>{skill.content}</code></pre>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          {skill.is_installed ? (
            <Button variant="destructive" onClick={() => onUninstall(skill.id)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Uninstall Skill
            </Button>
          ) : (
            <Button onClick={() => onInstall(skill.id)}>
              <Upload className="w-4 h-4 mr-2" />
              Install Skill
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadSkillDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [instructions, setInstructions] = useState("");
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (data: { file: File, meta: Record<string, string> }) => skillsApi.uploadSkill(data.file, data.meta),
    onSuccess: () => {
      toast.success("Skill uploaded to marketplace successfully");
      setOpen(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["skills"] });
    },
    onError: () => toast.error("Failed to upload skill")
  });

  const resetForm = () => {
    setFile(null);
    setName("");
    setDescription("");
    setAuthor("");
    setVersion("1.0.0");
    setInstructions("");
    const fileInput = document.getElementById('skill-file') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.endsWith('.md')) {
        toast.error("Please upload a .md file");
        return;
      }
      setFile(selected);
      if (!name) {
        setName(selected.name.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !description) {
      toast.error("Please fill in all required fields and select a file");
      return;
    }

    uploadMutation.mutate({
      file,
      meta: { name, description, author: author || "Community", version, instructions }
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="w-4 h-4" />
          Upload Skill
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload New Skill</DialogTitle>
            <DialogDescription>
              Add a new prompt template to the marketplace (.md format).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill-file">Template File (.md) *</Label>
              <Input
                id="skill-file"
                type="file"
                accept=".md"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Skill Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Creative Writer"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Short Description *</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this skill do?"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instructions">Usage Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="How should users interact with this skill? (Markdown supported)"
                className="h-24 resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={uploadMutation.isPending || !file || !name || !description}>
              {uploadMutation.isPending ? "Uploading..." : "Upload to Marketplace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
