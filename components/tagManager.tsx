// ./components/tagManager

'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MoreVertical, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError } from '@/components/ui/field';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateTagFormSchema, type CreateTagForm, type Tag, UpdateTagSchema } from '@/schemas';
import { getTags, createTag, updateTag, deleteTag } from '@/app/tags/actions';
import { toast } from 'sonner';

export default function TagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { control, handleSubmit, reset } = useForm<CreateTagForm>({
    resolver: zodResolver(CreateTagFormSchema),
    defaultValues: {
      name: '',
    },
  });

  // Load tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const data = await getTags();
      setTags(data);
    } catch (error) {
      toast.error('Failed to load tags')
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateTagForm) => {
    try {
      const newTag = await createTag(data);
      setTags([...tags, newTag]);
      reset();
      toast.success('Tag created successfully')
    } catch (error) {
      toast.error('Failed to create tag')
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      const validation = UpdateTagSchema.safeParse({ name: editValue });
      if (!validation.success) {
        toast.warning(validation.error.issues[0].message);
        return;
      }

      const updatedTag = await updateTag(id, { name: editValue });
      setTags(tags.map((tag) => (tag.id === id ? updatedTag : tag)));
      setEditingId(null);
      toast.success('Tag updated successfully');
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleDeleteClick = (tag: Tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!tagToDelete) return;

    try {
      await deleteTag(tagToDelete.id);
      setTags(tags.filter((tag) => tag.id !== tagToDelete.id));
      toast.success('Tag deleted successfully')
    } catch (error) {
      toast.error('Failed to delete tag')
    } finally {
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading tags...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-4">
      {/* Add Tag Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="flex-1">
              <Input
                id="tag-name"
                placeholder="Enter tag name..."
                {...field}
                value={field.value ?? ''}
                className={fieldState.invalid ? 'border-destructive focus-visible:ring-destructive' : ''}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Button type="submit" size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tags yet. Create one above!</p>
        ) : (
          tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              {editingId === tag.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(tag.id);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSaveEdit(tag.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{tag.name}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(tag)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(tag)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tag "{tagToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}