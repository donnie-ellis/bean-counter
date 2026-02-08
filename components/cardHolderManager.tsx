'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Cardholder, CreateCardholderFormSchema, UpdateCardholderSchema } from '@/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getCardholders } from '@/app/cardholder/actions';
import { getUserProfiles } from '@/app/admin/users/actions';
import { Profile } from '@/schemas';

interface CardholderManagerProps {
  onCreate: (data: { user_id: string; name: string }) => Promise<void>;
  onUpdate: (id: string, data: Partial<{ user_id: string; name: string }>) => Promise<void>;
  onDelete: (id: string) => Promise<{success: boolean}>;
}

export const CardholderManager: React.FC<CardholderManagerProps> = ({ onCreate, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardholders, setCardholders] = useState<Cardholder[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    async function fetchCardholders() {
        const { data: cardholdersData, error: cardholdersError } = await getCardholders();
        if (cardholdersError || !cardholdersData) {
            console.error('Error fetching cardholders: ', cardholdersError)
            toast.error('Error fetching cardholders')
            return;
        }
        setCardholders(cardholdersData);
    }
    fetchCardholders();
}, [cardholders]);

useEffect(() => {
  async function fetchProfiles() {
      const { data: profilesData, error: profilesError } = await getUserProfiles();
      if (profilesError || !profilesData) {
          console.error('Error fetching user profiles: ', profilesError)
          toast.error('Error fetching user profiles')
          return;
      }
      setProfiles(profilesData);
  }
  fetchProfiles();
}, []);

const createForm = useForm<z.infer<typeof CreateCardholderFormSchema>>({
    resolver: zodResolver(CreateCardholderFormSchema),
    defaultValues: { 
      name: '', 
      user_id: '' 
    },
  });

  const updateForm = useForm<z.infer<typeof UpdateCardholderSchema>>({
    resolver: zodResolver(UpdateCardholderSchema),
    defaultValues: { name: '', user_id: '' },
  });

  useEffect(() => {
    if (editingId) {
      const cardholder = cardholders.find((c) => c.id === editingId);
      if (cardholder) {
        updateForm.reset({
          name: cardholder.name,
          user_id: cardholder.user_id,
        });
      }
    }
  }, [editingId, cardholders, updateForm]);

  const handleCreate = async (data: any) => {
    try {
      if (!data.user_id) {
        toast('Select a user first');
        return;
      }
      await onCreate(data);
      createForm.reset();
      toast('Cardholder created successfully');
    } catch (err) {
      console.error(err);
      toast('Failed to create cardholder');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!editingId) return;
    try {
      await onUpdate(editingId, data);
      setEditingId(null);
      toast('Cardholder updated successfully');
    } catch (err) {
      console.error(err);
      toast('Failed to update cardholder');
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Cardholder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Label>Assign User</Label>
          <Select
            onValueChange={(value) => {
              createForm.setValue('user_id', value);
              const selectedProfile = profiles.find((p) => p.id === value);
              if (selectedProfile) {
                createForm.setValue('name', `${selectedProfile.first_name} ${selectedProfile.last_name}`);
              }
            }}
            defaultValue=""
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Name</Label>
          <Input {...createForm.register('name')} placeholder="Cardholder name" />
        </CardContent>
        <CardFooter>
          <Button onClick={createForm.handleSubmit(handleCreate)}>Create</Button>
        </CardFooter>
      </Card>

      <Separator />

      {/* Existing Cardholders */}
      {cardholders.map((cardholder) => (
        <Card key={cardholder.id}>
          <CardHeader>
            <CardTitle>
              {editingId === cardholder.id ? 'Edit Cardholder' : cardholder.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingId === cardholder.id ? (
              <>
                <Label>User</Label>
                <Select
                  onValueChange={(value) => updateForm.setValue('user_id', value)}
                  defaultValue={updateForm.getValues('user_id')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.first_name} {p.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Name</Label>
                <Input {...updateForm.register('name')} placeholder="Cardholder name" />
              </>
            ) : (
              <p>User: {profiles.find((p) => p.id === cardholder.user_id)?.first_name} {profiles.find((p) => p.id === cardholder.user_id)?.last_name}</p>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            {editingId === cardholder.id ? (
              <>
                <Button variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
                <Button onClick={updateForm.handleSubmit(handleUpdate)}>Save</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditingId(cardholder.id)}>Edit</Button>
                <Button variant="destructive" onClick={() => {
                  onDelete(cardholder.id)
                  toast('Cardholder deleted successfully');
                }}>Delete</Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
