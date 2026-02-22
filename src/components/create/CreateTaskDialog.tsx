import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTask } from '@/api/tasks'
import { Plus, Trash2, Loader2 } from 'lucide-react'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: string
  features: string[]
  onTaskCreated: () => void
}

export function CreateTaskDialog({
  open,
  onOpenChange,
  project,
  features,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [title, setTitle] = useState('')
  const [objective, setObjective] = useState('')
  const [feature, setFeature] = useState<string>('')
  const [newFeature, setNewFeature] = useState('')
  const [steps, setSteps] = useState<string[]>([''])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setTitle('')
    setObjective('')
    setFeature('')
    setNewFeature('')
    setSteps([''])
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleAddStep = () => {
    setSteps([...steps, ''])
  }

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = value
    setSteps(newSteps)
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (!objective.trim()) {
      setError('Objective is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const selectedFeature = feature === '__new__' ? newFeature.trim() : feature
      const filteredSteps = steps.filter((s) => s.trim())

      await createTask(project, {
        title: title.trim(),
        objective: objective.trim(),
        steps: filteredSteps.length > 0 ? filteredSteps : undefined,
        feature: selectedFeature || undefined,
      })

      handleClose()
      onTaskCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Objective <span className="text-red-500">*</span>
            </label>
            <Textarea
              placeholder="What should this task accomplish?"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feature (optional)</label>
            <Select value={feature} onValueChange={setFeature}>
              <SelectTrigger>
                <SelectValue placeholder="Select feature" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {features.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
                <SelectItem value="__new__">+ New feature</SelectItem>
              </SelectContent>
            </Select>
            {feature === '__new__' && (
              <Input
                placeholder="New feature name"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Steps (optional)</label>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Step ${index + 1}`}
                    value={step}
                    onChange={(e) => handleStepChange(index, e.target.value)}
                  />
                  {steps.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveStep(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStep}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add step
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
