"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  image_url: string | null
  read_time: number
  published: boolean
  featured: boolean
  created_at: string
}

interface BlogPostManagerProps {
  posts: BlogPost[]
}

export function BlogPostManager({ posts: initialPosts }: BlogPostManagerProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image_url: "",
    read_time: 5,
    published: false,
    featured: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image_url: "",
      read_time: 5,
      published: false,
      featured: false,
    })
    setEditingPost(null)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleOpenDialog = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post)
      setFormData({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image_url: post.image_url || "",
        read_time: post.read_time,
        published: post.published,
        featured: post.featured,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createBrowserSupabaseClient()

    if (editingPost) {
      const { data } = await supabase.from("blog_posts").update(formData).eq("id", editingPost.id).select().single()

      if (data) {
        setPosts(posts.map((p) => (p.id === editingPost.id ? data : p)))
      }
    } else {
      const { data } = await supabase.from("blog_posts").insert(formData).select().single()

      if (data) {
        setPosts([data, ...posts])
      }
    }

    setIsLoading(false)
    setIsDialogOpen(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    const supabase = createBrowserSupabaseClient()
    await supabase.from("blog_posts").delete().eq("id", id)
    setPosts(posts.filter((p) => p.id !== id))
    router.refresh()
  }

  const togglePublished = async (id: string, published: boolean) => {
    const supabase = createBrowserSupabaseClient()
    await supabase.from("blog_posts").update({ published }).eq("id", id)
    setPosts(posts.map((p) => (p.id === id ? { ...p, published } : p)))
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-foreground">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="excerpt" className="text-foreground">
                  Excerpt
                </Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  required
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="content" className="text-foreground">
                  Content (HTML)
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                  className="bg-background border-border font-mono text-sm"
                />
              </div>
              <div>
                <Label htmlFor="image_url" className="text-foreground">
                  Image URL
                </Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="/placeholder.svg?height=600&width=1000"
                  className="bg-background border-border"
                />
              </div>
              <div>
                <Label htmlFor="read_time" className="text-foreground">
                  Read Time (minutes)
                </Label>
                <Input
                  id="read_time"
                  type="number"
                  min="1"
                  value={formData.read_time}
                  onChange={(e) => setFormData({ ...formData, read_time: Number(e.target.value) })}
                  className="bg-background border-border"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="published" className="text-foreground">
                  Published
                </Label>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="text-foreground">
                  Featured
                </Label>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                {isLoading ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">No blog posts yet</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground">{post.title}</h3>
                  {post.featured && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">Featured</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => togglePublished(post.id, !post.published)}
                  className={`p-2 rounded-lg transition-colors ${
                    post.published ? "bg-green-500/20 text-green-400" : "bg-muted text-muted-foreground"
                  }`}
                  title={post.published ? "Published" : "Draft"}
                >
                  {post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(post)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
