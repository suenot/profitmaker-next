import React, { useState } from 'react';
import { useUserStore, User } from '@/store/userStore';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetFooter,
  SheetDescription,
} from './ui/sheet';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Plus, Trash2, Check } from 'lucide-react';

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDrawer: React.FC<UserDrawerProps> = ({ open, onOpenChange }) => {
  const users = useUserStore((s) => s.users);
  const activeUserId = useUserStore((s) => s.activeUserId);
  const addUser = useUserStore((s) => s.addUser);
  const removeUser = useUserStore((s) => s.removeUser);
  const setActiveUser = useUserStore((s) => s.setActiveUser);
  const updateUser = useUserStore((s) => s.updateUser);

  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addUser(newName.trim(), newAvatar.trim() || undefined);
      setNewName('');
      setNewAvatar('');
    }
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditAvatar(user.avatarUrl || '');
  };

  const handleEditSave = (userId: string) => {
    updateUser(userId, { name: editName, avatarUrl: editAvatar });
    setEditId(null);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] bg-terminal-widget border-l border-terminal-border flex flex-col">
        <SheetHeader>
          <SheetTitle>Пользователи</SheetTitle>
          <SheetDescription>Управление пользователями и аккаунтами</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 py-2 flex-1 overflow-auto">
          {/* Новый пользователь */}
          <div className="flex gap-2 items-center mb-2">
            <Input
              placeholder="Имя пользователя"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="URL аватарки"
              value={newAvatar}
              onChange={e => setNewAvatar(e.target.value)}
              className="flex-1"
            />
            <Button size="icon" variant="outline" onClick={handleAdd} title="Добавить пользователя">
              <Plus size={18} />
            </Button>
          </div>
          {/* Список пользователей */}
          <div className="flex flex-col gap-2">
            {users.map(user => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-2 rounded-lg border border-terminal-border/50 ${user.id === activeUserId ? 'bg-terminal-accent/30' : ''}`}
              >
                <Avatar className="w-10 h-10">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : (
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  )}
                </Avatar>
                {editId === user.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      value={editAvatar}
                      onChange={e => setEditAvatar(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="icon" variant="outline" onClick={() => handleEditSave(user.id)} title="Сохранить">
                      <Check size={16} />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{user.name}</div>
                      <div className="text-xs text-terminal-muted truncate">{user.accounts.length} аккаунтов</div>
                    </div>
                    <Button
                      size="icon"
                      variant={user.id === activeUserId ? 'default' : 'outline'}
                      onClick={() => setActiveUser(user.id)}
                      title="Сделать активным"
                    >
                      {user.id === activeUserId ? <Check size={16} /> : <span className="w-4 h-4 rounded-full border border-terminal-border" />}
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => handleEdit(user)} title="Редактировать">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 0 0 0-1.414l-3.586-3.586a1 1 0 0 0-1.414 0L3 15v6z" /></svg>
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => removeUser(user.id)} title="Удалить">
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline">Закрыть</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UserDrawer; 