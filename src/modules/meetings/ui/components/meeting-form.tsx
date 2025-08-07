import { useTRPC } from "@/trpc/client";
import { MeetingGetOne } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { meetingInsertSchema } from "../../schema";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import CommandSelect from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import NewAgentDialog from "@/modules/agents/ui/components/new-agent-dialog";

interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initalValues?: MeetingGetOne;
}

const MeetingForm = ({ onSuccess, onCancel, initalValues }: MeetingFormProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");

  const agents = useQuery(trpc.agents.getMany.queryOptions({
    pageSize: 100,
    search: agentSearch
  }));

  const createMeeting = useMutation(trpc.meetings.create.mutationOptions({
    onSuccess: async (data) => {
      await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
      onSuccess?.(data.id);
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }));

  const updateMeeting = useMutation(trpc.meetings.update.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
      if (initalValues?.id) {
        await queryClient.invalidateQueries(trpc.meetings.getOne.queryOptions({ id: initalValues.id }));
      }
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    }
  }));

  const form = useForm<z.infer<typeof meetingInsertSchema>>({
    resolver: zodResolver(meetingInsertSchema),
    defaultValues: {
      name: initalValues?.name ?? "",
      agentId: initalValues?.agentId ?? "",
    },
  });

  const isEdit = !!initalValues?.id;

  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const onSubmit = (values: z.infer<typeof meetingInsertSchema>) => {
    if (isEdit) {
      updateMeeting.mutate({ id: initalValues.id, ...values });
    } else {
      createMeeting.mutate(values);
    }
  }
  return (
    <>
    <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField name="name" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter meeting name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="agentId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Agent</FormLabel>
              <FormControl>
                <CommandSelect
                  options={(agents.data?.items ?? []).map((agent) => ({
                    id: agent.id,
                    value: agent.id,
                    children: (
                      <div className="flex items-center gap-x-2">
                        <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="border size-6" />
                        <span>{agent.name}</span>
                      </div>
                    )
                  }))}
                  onSelect={field.onChange}
                  onSearch={setAgentSearch}
                  value={field.value}
                  placeholder="Select an agent"
                  isSearchable
                />
              </FormControl>
              <FormDescription>
                Not found what&apos;re looking for?{" "}
                <button type="button" className="text-primary hover:underline" onClick={() => setOpenNewAgentDialog(true)}>
                  Create a new agent
                </button>
              </FormDescription>
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
    </>
  )
}

export default MeetingForm