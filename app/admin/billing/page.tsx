import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Plus, X } from "lucide-react";

const benefits = [
  { label: "25,500 orders per month", active: true },
  { label: "Unlimited integrations", active: true },
  { label: "10 GB storage", active: true },
  { label: "Custom templates", active: false },
  { label: "Advanced marketing tools", active: false },
];

const paymentMethods = [
  { name: "Mastercard", detail: "**** **** **** 9029", default: true },
  { name: "Visa", detail: "**** **** **** 4328", default: false },
  { name: "Paypal", detail: "name@example.com", default: false },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-sm text-slate-500">
          Manage plan details, billing address, and payment methods.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border p-5">
              <InfoRow label="Current Plan" value="Professional" />
              <InfoRow label="Monthly Limits" value="25,000 Orders" />
              <InfoRow label="Cost" value="$199.00/month" />
              <InfoRow label="Renewal Date" value="Mar 22, 2028" />
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span>Orders</span>
                  <span>15,299 of 25,500 used</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className="h-2 w-3/5 rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-6">
              <div>
                <h3 className="mb-4 font-semibold">Plan Benefits</h3>
                <ul className="space-y-3 text-sm">
                  {benefits.map((benefit) => (
                    <li
                      key={benefit.label}
                      className="flex items-center gap-3 text-slate-600"
                    >
                      {benefit.active ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-slate-400" />
                      )}
                      <span className={benefit.active ? "" : "line-through"}>
                        {benefit.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline">Cancel Subscription</Button>
                <Button>Upgrade to Pro</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <InfoLine label="Name" value="ST Thangka Store" />
            <InfoLine label="Street" value="800 E Elcamino Real, suite #400" />
            <InfoLine label="City/State" value="Mountain View, CA, 94040" />
            <InfoLine label="Country" value="United States" />
            <InfoLine label="Zip/Postal code" value="19029" />
            <Button variant="outline" className="mt-6 w-full">
              Update Billing Address
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Payment Methods</CardTitle>
          <Button variant="outline" className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add New Card
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          {paymentMethods.map((method) => (
            <div key={method.name} className="rounded-lg border p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-white">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{method.name}</p>
                  <p className="text-sm text-slate-500">{method.detail}</p>
                </div>
                {method.default ? (
                  <span className="ml-auto rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                    Default
                  </span>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-2 min-[440px]:flex">
                {!method.default ? (
                  <Button variant="outline" size="sm">
                    Make Default
                  </Button>
                ) : null}
                <Button variant="outline" size="sm">
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b py-3 first:pt-0 last:border-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b pb-3 last:border-0 min-[420px]:grid-cols-[130px_1fr]">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

