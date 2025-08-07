import { useTRPC } from "@/trpc/client";
import { AgentGetOne } from "../../types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { agentInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initalValues?: AgentGetOne;
}

const AgentForm = ({ onSuccess, onCancel, initalValues }: AgentFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createAgent = useMutation(trpc.agents.create.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }));

  const updateAgent = useMutation(trpc.agents.update.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.agents.getMany.queryOptions({}));
      if (initalValues?.id) {
        await queryClient.invalidateQueries(trpc.agents.getOne.queryOptions({ id: initalValues.id }));
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }));

  const form = useForm<z.infer<typeof agentInsertSchema>>({
    resolver: zodResolver(agentInsertSchema),
    defaultValues: {
      name: initalValues?.name ?? "",
      instructions: initalValues?.instructions ?? "",
    },
  });

  const isEdit = !!initalValues?.id;

  const isPending = createAgent.isPending || updateAgent.isPending;

  const onSubmit = (values: z.infer<typeof agentInsertSchema>) => {
    if (isEdit) {
      updateAgent.mutate({ id: initalValues.id, ...values });
    } else {
      createAgent.mutate(values);
    }
  }
  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <GeneratedAvatar seed={form.watch("name")} variant="botttsNeutral" className="border size-16" />
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="ex: MERN Interviewer" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="instructions" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Instructions</FormLabel>
            <FormControl>
              <Textarea {...field} placeholder="Enter instructions for the agent" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-x-2">
          {onCancel && (
            <Button variant="ghost" disabled={isPending} type="button" onClick={() => onCancel()}>
              Cancel
            </Button>
          )}
          <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default AgentForm