"use client"

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Building, MapPin, Clock, Briefcase, Phone } from "lucide-react"

interface JobCardProps {
  title?: string
  company?: string
  rate?: string
  location?: string
  type?: string
  experience?: string
  logoUrl?: string
  customerId?: string
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onViewInvoices?: (id: string) => void
  onCreateInvoice?: (id: string) => void
}

export default function JobCard({
  title = "Alexander Hajduk Storgaard",
  company = "adkakadma",
  rate = "USD",
  location = "Ikast, Danmark",
  type = "52236933",
  experience = "30d terms",
  logoUrl = "",
  customerId = "",
  onEdit,
  onDelete,
  onViewInvoices,
  onCreateInvoice,
}: JobCardProps) {
  return (
    <Card className="relative w-full rounded-2xl shadow-sm border border-border bg-card text-card-foreground transition-colors hover:shadow-md">
      {/* Edit button positioned at the top-right corner */}
      <Button
        variant="outline"
        size="sm"
        className="absolute top-4 right-4 rounded-xl px-3"
        onClick={() => customerId && onEdit?.(customerId)}
      >
        <Building className="h-4 w-4 mr-1" />
        Edit
      </Button>

      {/* Header with avatar + rate */}
      <CardHeader className="flex flex-row items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={logoUrl} alt={company} />
            <AvatarFallback>
              {company.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{company}</p>
            <p className="text-sm text-muted-foreground">{rate}</p>
          </div>
        </div>
      </CardHeader>

      {/* Main content */}
      <CardContent className="px-4 py-3">
        <h2 className="text-xl font-medium leading-snug">{title}</h2>
        <div className="mt-3 space-y-2 text-sm">
          <p className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            {location}
          </p>
          <p className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            {type}
          </p>
          <p className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            {experience}
          </p>
        </div>
      </CardContent>

      {/* Footer with two buttons */}
      <CardFooter className="flex justify-end gap-2 px-4 py-6 border-t border-border">
        <Button
          variant="secondary"
          className="rounded-xl px-4"
          onClick={() => customerId && onViewInvoices?.(customerId)}
        >
          <Briefcase className="h-4 w-4 mr-2" />
          View Invoices
        </Button>
        <Button
          variant="default"
          className="rounded-xl px-6"
          onClick={() => customerId && onCreateInvoice?.(customerId)}
        >
          Create Invoice
        </Button>
      </CardFooter>
    </Card>
  )
}
  