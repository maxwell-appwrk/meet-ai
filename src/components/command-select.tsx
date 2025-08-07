import { ReactNode, useState } from "react";
import { CommandEmpty, CommandInput, CommandItem, CommandList, CommandResponsiveDialog } from "./ui/command";
import { Button } from "./ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandSelectProps {
    options: Array<{ id: string, value: string, children: ReactNode }>
    onSelect: (value: string) => void,
    onSearch?: (search: string) => void,
    value: string,
    placeholder?: string,
    isSearchable?: boolean
    className?: string
}

const CommandSelect = ({
    options,
    onSelect,
    onSearch,
    value,
    placeholder,
    className
}: CommandSelectProps) => {
    const [open, setOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);
    return (
        <>
            <Button type="button" variant="outline" className={cn("h-9 justify-between font-normal px-2", !selectedOption && "text-muted-foreground", className)} onClick={() => setOpen(true)}>
                <div>
                    {selectedOption?.children ?? placeholder}
                </div>
                <ChevronsUpDownIcon />
            </Button>
            <CommandResponsiveDialog open={open} onOpenChange={setOpen} className={className} shouldFilter={!onSearch}>
                <CommandInput placeholder="Search..." onValueChange={onSearch} />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {options.map((option) => (
                        <CommandItem key={option.id} onSelect={() => {
                            onSelect(option.value);
                            setOpen(false);
                        }}>
                            {option.children}
                        </CommandItem>
                    ))}
                </CommandList>
            </CommandResponsiveDialog>
        </>
    )
}

export default CommandSelect
