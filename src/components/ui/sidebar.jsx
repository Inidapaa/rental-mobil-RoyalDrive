import * as React from "react";
import { cn } from "../../lib/utils";

const Sidebar = React.forwardRef(({ className, ...props }, ref) => (
  <aside ref={ref} className={cn("flex flex-col", className)} {...props} />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-2 px-4 py-4 border-b", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto px-4 py-4", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-4 py-4 border-t", className)} {...props} />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <nav ref={ref} className={cn("space-y-2", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef(
  ({ className, isActive, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium",
        isActive
          ? "bg-primary text-dark-lighter"
          : "text-[#a0a0a0] hover:bg-dark-light hover:text-primary",
        className
      )}
      {...props}
    />
  )
);
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
