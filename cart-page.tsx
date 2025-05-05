"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, Trash2, Gift, Clock, MapPin, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCart } from "@/context/cart-context"

// Generate time slots for pickup/delivery
const generateTimeSlots = () => {
  const slots = []
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Start from the next 30-minute slot
  let startHour = currentHour
  const startMinute = currentMinute < 30 ? 30 : 0
  if (currentMinute >= 30) startHour += 1

  // Generate slots for today (if still within operating hours)
  if (startHour < 19) {
    // Assuming store closes at 7pm
    for (let hour = startHour; hour < 19; hour++) {
      for (const minute of hour === startHour && startMinute === 30 ? [30] : [0, 30]) {
        if (!(hour === startHour && minute < startMinute)) {
          const timeString = `${hour % 12 || 12}:${minute === 0 ? "00" : minute} ${hour < 12 ? "AM" : "PM"}`
          slots.push({ value: `today-${hour}-${minute}`, label: `Today at ${timeString}` })
        }
      }
    }
  }

  // Generate slots for tomorrow
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = tomorrow.toLocaleDateString("en-US", { weekday: "long" })

  for (let hour = 7; hour < 19; hour++) {
    // 7am to 7pm
    for (const minute of [0, 30]) {
      const timeString = `${hour % 12 || 12}:${minute === 0 ? "00" : minute} ${hour < 12 ? "AM" : "PM"}`
      slots.push({ value: `tomorrow-${hour}-${minute}`, label: `${tomorrowString} at ${timeString}` })
    }
  }

  return slots
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, subtotal } = useCart()
  const [tip, setTip] = useState(1)
  const [customTip, setCustomTip] = useState<number | null>(null)
  const [deliveryOption, setDeliveryOption] = useState("pickup")
  const [timeSlot, setTimeSlot] = useState("")
  const [address, setAddress] = useState("")
  const timeSlots = generateTimeSlots()

  // Calculate tax (example rate: 8.25%)
  const taxRate = 0.0825
  const tax = subtotal * taxRate

  // Calculate delivery fee
  const deliveryFee = deliveryOption === "delivery" ? 3.99 : 0
  const shippingFee = deliveryOption === "shipping" ? 5.99 : 0

  // Calculate total
  const total = subtotal + tax + (customTip || tip) + deliveryFee + shippingFee

  // Handle tip selection
  const handleTipSelect = (amount: number) => {
    setTip(amount)
    setCustomTip(null)
  }

  // Handle custom tip input
  const handleCustomTip = (value: string) => {
    const amount = Number.parseFloat(value)
    if (!isNaN(amount)) {
      setCustomTip(amount)
    } else {
      setCustomTip(null)
    }
  }

  // Handle continue to payment
  const handleContinueToPayment = () => {
    // Validate required fields
    if (!timeSlot) {
      alert("Please select a pickup or delivery time")
      return
    }

    if (deliveryOption === "delivery" && !address.trim()) {
      alert("Please enter your delivery address")
      return
    }

    // Store delivery details in localStorage for the payment page
    const orderDetails = {
      items,
      subtotal,
      tax,
      tip: customTip || tip,
      deliveryOption,
      timeSlot: timeSlots.find((slot) => slot.value === timeSlot)?.label || timeSlot,
      address: deliveryOption === "delivery" ? address : "",
      deliveryFee,
      shippingFee,
      total,
    }

    localStorage.setItem("orderDetails", JSON.stringify(orderDetails))

    // Navigate to payment page
    router.push("/payment")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <Button variant="ghost" className="flex items-center gap-2" onClick={() => router.push("/menu")}>
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Button>
          <h1 className="text-2xl font-bold">Came</h1>
          <div className="w-[100px]"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold">Your cart</h1>

          {items.length === 0 ? (
            <div className="rounded-lg border p-8 text-center">
              <h2 className="mb-4 text-xl font-medium">Your cart is empty</h2>
              <p className="mb-6 text-gray-600">Add some items to your cart to get started.</p>
              <Button onClick={() => router.push("/menu")}>Browse Menu</Button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-3">
              {/* Cart Items */}
              <div className="md:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-medium uppercase">
                    Your order ({items.length} item{items.length !== 1 ? "s" : ""})
                  </h2>
                  <Button variant="link" onClick={() => router.push("/menu")}>
                    Edit
                  </Button>
                </div>

                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{item.size}</p>
                        {item.options.map((option, index) => (
                          <p key={index} className="text-sm text-gray-600">
                            {option}
                          </p>
                        ))}
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-4 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 rounded-full p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="mt-6 w-full" onClick={() => router.push("/menu")}>
                  Add more items
                </Button>
              </div>

              {/* Order Summary */}
              <div>
                <div className="rounded-lg border p-6">
                  <h2 className="mb-4 text-lg font-medium uppercase">How to get it</h2>

                  {/* Delivery Options */}
                  <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption} className="mb-4">
                    <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="pickup" id="pickup" className="mt-1" />
                      <div className="flex flex-1 flex-col">
                        <Label htmlFor="pickup" className="flex cursor-pointer items-center gap-2 font-medium">
                          <MapPin className="h-4 w-4" /> Pickup
                        </Label>
                        <p className="text-sm text-muted-foreground">Pick up your order at our store</p>
                      </div>
                      <div className="text-sm font-medium">Free</div>
                    </div>

                    <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="delivery" id="delivery" className="mt-1" />
                      <div className="flex flex-1 flex-col">
                        <Label htmlFor="delivery" className="flex cursor-pointer items-center gap-2 font-medium">
                          <Truck className="h-4 w-4" /> Delivery
                        </Label>
                        <p className="text-sm text-muted-foreground">Delivered to your address</p>
                      </div>
                      <div className="text-sm font-medium">$3.99</div>
                    </div>

                    <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="dine-in" id="dine-in" className="mt-1" />
                      <div className="flex flex-1 flex-col">
                        <Label htmlFor="dine-in" className="flex cursor-pointer items-center gap-2 font-medium">
                          <Clock className="h-4 w-4" /> Dine-in
                        </Label>
                        <p className="text-sm text-muted-foreground">Enjoy your order at our store</p>
                      </div>
                      <div className="text-sm font-medium">Free</div>
                    </div>

                    <div className="flex items-start space-x-2 rounded-md border p-3 hover:bg-muted/50">
                      <RadioGroupItem value="shipping" id="shipping" className="mt-1" />
                      <div className="flex flex-1 flex-col">
                        <Label htmlFor="shipping" className="flex cursor-pointer items-center gap-2 font-medium">
                          <Truck className="h-4 w-4" /> Ship to me
                        </Label>
                        <p className="text-sm text-muted-foreground">Ship to your address (2-3 business days)</p>
                      </div>
                      <div className="text-sm font-medium">$5.99</div>
                    </div>
                  </RadioGroup>

                  {/* Time Selection */}
                  {deliveryOption !== "shipping" && (
                    <div className="mb-4">
                      <Label htmlFor="time-select" className="mb-2 block">
                        {deliveryOption === "pickup"
                          ? "Pickup time"
                          : deliveryOption === "delivery"
                            ? "Delivery time"
                            : "Arrival time"}
                      </Label>
                      <Select value={timeSlot} onValueChange={setTimeSlot}>
                        <SelectTrigger id="time-select">
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Address Input for Delivery */}
                  {(deliveryOption === "delivery" || deliveryOption === "shipping") && (
                    <div className="mb-4">
                      <Label htmlFor="address" className="mb-2 block">
                        Delivery Address
                      </Label>
                      <Input
                        id="address"
                        placeholder="Enter your full address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mb-2"
                      />
                      {deliveryOption === "delivery" && (
                        <p className="text-xs text-muted-foreground">Delivery available within 5 miles of our store</p>
                      )}
                    </div>
                  )}

                  {/* Location for Pickup/Dine-in */}
                  {(deliveryOption === "pickup" || deliveryOption === "dine-in") && (
                    <div className="mb-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 flex-shrink-0">📍</div>
                        <p>1813 N Milwaukee Ave Ste 1</p>
                      </div>
                    </div>
                  )}

                  <Separator className="my-6" />

                  <h2 className="mb-4 text-lg font-medium uppercase">Add a tip</h2>

                  <div className="mb-6 grid grid-cols-4 gap-2">
                    <Button
                      variant={tip === 1 && !customTip ? "default" : "outline"}
                      onClick={() => handleTipSelect(1)}
                      className="w-full"
                    >
                      $1.00
                    </Button>
                    <Button
                      variant={tip === 2 && !customTip ? "default" : "outline"}
                      onClick={() => handleTipSelect(2)}
                      className="w-full"
                    >
                      $2.00
                    </Button>
                    <Button
                      variant={tip === 3 && !customTip ? "default" : "outline"}
                      onClick={() => handleTipSelect(3)}
                      className="w-full"
                    >
                      $3.00
                    </Button>
                    <Button
                      variant={customTip ? "default" : "outline"}
                      onClick={() => setCustomTip(0)}
                      className="w-full"
                    >
                      Other
                    </Button>
                  </div>

                  {customTip !== null && (
                    <div className="mb-6">
                      <Input
                        type="number"
                        placeholder="Enter custom tip amount"
                        value={customTip || ""}
                        onChange={(e) => handleCustomTip(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  )}

                  <Separator className="my-6" />

                  <div className="mb-6">
                    <div className="relative">
                      <Gift className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                      <Input placeholder="Add coupon or gift card" className="pl-10" />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated taxes</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tip</span>
                      <span>${(customTip || tip).toFixed(2)}</span>
                    </div>
                    {deliveryOption === "delivery" && (
                      <div className="flex justify-between">
                        <span>Delivery fee</span>
                        <span>${deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    {deliveryOption === "shipping" && (
                      <div className="flex justify-between">
                        <span>Shipping fee</span>
                        <span>${shippingFee.toFixed(2)}</span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Estimated order total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">Additional taxes and fees will be calculated at checkout</p>

                  <Button className="mt-6 w-full" onClick={handleContinueToPayment}>
                    Continue to payment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
