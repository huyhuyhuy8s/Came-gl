"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart, Search, Minus, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { useCart } from "@/context/cart-context"
import { UserMenu } from "@/components/user-menu"
import { getProductById } from "@/lib/product-service"

// Categories
const categories = ["All", "Coffee", "Lattes & Seasonal", "Pastry", "Merchandise", "Other Drinks"]

export default function MenuPageSupabase({ initialProducts = [] }) {
  const router = useRouter()
  const { addItem, itemCount } = useCart()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedItemDetails, setSelectedItemDetails] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState(initialProducts)
  const [isLoading, setIsLoading] = useState(false)

  // Filter items by selected category and search query
  const filteredItems = products.filter((item) => {
    // First filter by category
    const categoryMatch = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase()

    // Then filter by search query if one exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = item.name.toLowerCase().includes(query)
      const descriptionMatch = item.description && item.description.toLowerCase().includes(query)
      return categoryMatch && (nameMatch || descriptionMatch)
    }

    return categoryMatch
  })

  // Handle opening the modal
  const openItemModal = async (item) => {
    setIsLoading(true)
    setSelectedItem(item)

    try {
      // Fetch detailed product information including sizes and options
      const { product, sizes, options } = await getProductById(item.id)

      setSelectedItemDetails({
        ...product,
        sizes: sizes || [],
        options: options || [],
      })

      setQuantity(1)
      setSelectedSize(sizes && sizes.length > 0 ? sizes[0].value : "")
      setSelectedOption(options && options.length > 0 ? options[0].value : "")
    } catch (error) {
      console.error("Error fetching product details:", error)
      toast({
        title: "Error",
        description: "Failed to load product details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle closing the modal
  const closeItemModal = () => {
    setSelectedItem(null)
    setSelectedItemDetails(null)
  }

  // Handle quantity changes
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  // Get price based on selected size
  const getPrice = () => {
    if (!selectedItemDetails || !selectedSize) return selectedItemDetails?.price_min || 0

    const size = selectedItemDetails.sizes?.find((s) => s.value === selectedSize)
    return size?.price || selectedItemDetails.price_min
  }

  // Handle adding item to cart
  const handleAddToCart = () => {
    if (!selectedItemDetails || !selectedSize) return

    const size = selectedItemDetails.sizes?.find((s) => s.value === selectedSize)
    const sizeLabel = size?.label || ""
    const price = size?.price || selectedItemDetails.price_min

    // Calculate additional price for options
    let finalPrice = price
    let optionLabel = ""

    if (selectedOption) {
      const option = selectedItemDetails.options?.find((o) => o.value === selectedOption)
      if (option) {
        finalPrice += option.price_adjustment || 0
        optionLabel = option.label
      }
    }

    addItem({
      id: `${selectedItemDetails.id}-${selectedSize}-${selectedOption}`,
      name: selectedItemDetails.name,
      price: finalPrice,
      image: selectedItemDetails.image_url || "/placeholder.svg?height=300&width=300",
      quantity: quantity,
      size: sizeLabel,
      options: optionLabel ? [optionLabel] : [],
    })

    toast({
      title: "Added to cart",
      description: `${quantity} x ${selectedItemDetails.name} added to your cart`,
    })

    closeItemModal()
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b py-4">
        <div className="container mx-auto flex items-center justify-between px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium">
              Home
            </Link>
            <Link href="/menu" className="text-sm font-medium">
              Menu
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About us
            </Link>
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2 transform">
            <Link href="/" className="text-2xl font-bold">
              Came
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <UserMenu />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Shopping cart"
              className="relative"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Search and Categories */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="search"
                placeholder="Search menu"
                className="pl-10 w-full md:w-auto"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>

            <Tabs defaultValue={selectedCategory} onValueChange={setSelectedCategory} className="w-full md:w-auto">
              <TabsList className="flex w-full flex-wrap md:w-auto">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-sm">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Category Title */}
          <h1 className="mb-6 text-3xl font-bold">{selectedCategory}</h1>

          {/* Menu Items Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md"
                  onClick={() => openItemModal(item)}
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.image_url || "/placeholder.svg?height=300&width=300"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="mt-2 text-sm font-medium">${item.price_min.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="mb-2 text-xl font-medium">No items found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any items matching your search. Try different keywords or browse our categories.
                </p>
              </div>
              {searchQuery && (
                <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black py-8 text-white">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-xl font-medium">Came</h2>
          </div>
          <Separator className="mb-6 bg-gray-800" />
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-sm font-medium">Stay in the Loop</h3>
              <div className="flex max-w-md">
                <Input
                  type="email"
                  placeholder="Email"
                  className="rounded-r-none border-gray-700 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button className="rounded-l-none border border-l-0 border-gray-700">Sign Up</Button>
              </div>
            </div>
          </div>
          <p className="mt-8 text-xs text-gray-500">
            This form is protected by reCAPTCHA and the Google{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            apply.
          </p>
        </div>
      </footer>

      {/* Product Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && closeItemModal()}>
        <DialogContent className="max-w-md p-0 md:max-w-lg">
          <DialogClose className="absolute left-4 top-4 z-10 rounded-full bg-white p-1 shadow-md">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            selectedItemDetails && (
              <div className="flex flex-col">
                {/* Product Image */}
                <div className="relative h-64 w-full md:h-80">
                  <Image
                    src={selectedItemDetails.image_url || "/placeholder.svg?height=300&width=300"}
                    alt={selectedItemDetails.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <h2 className="mb-2 text-2xl font-bold">{selectedItemDetails.name}</h2>
                  <p className="mb-4 text-lg">
                    {selectedItemDetails.price_min.toFixed(2)} US$ - {selectedItemDetails.price_max.toFixed(2)} US$
                  </p>
                  <p className="mb-6 text-gray-600">{selectedItemDetails.description}</p>

                  {/* Quantity Selector */}
                  <div className="mb-6 flex items-center">
                    <Button variant="outline" size="icon" onClick={decreaseQuantity} className="h-8 w-8 rounded-full">
                      <Minus className="h-3 w-3" />
                      <span className="sr-only">Decrease quantity</span>
                    </Button>
                    <span className="mx-4 w-4 text-center">{quantity}</span>
                    <Button variant="outline" size="icon" onClick={increaseQuantity} className="h-8 w-8 rounded-full">
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Increase quantity</span>
                    </Button>
                  </div>

                  {/* Size Selector */}
                  {selectedItemDetails.sizes && selectedItemDetails.sizes.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-2 font-medium">Select size</p>
                      <Select value={selectedSize} onValueChange={setSelectedSize}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedItemDetails.sizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label} - ${size.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Options Selector */}
                  {selectedItemDetails.options && selectedItemDetails.options.length > 0 && (
                    <div className="mb-6">
                      <p className="mb-2 font-medium">Select an option</p>
                      <Select value={selectedOption} onValueChange={setSelectedOption}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select one" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedItemDetails.options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}{" "}
                              {option.price_adjustment > 0 ? `(+$${option.price_adjustment.toFixed(2)})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Add to Cart Button */}
                  <Button className="w-full rounded-full py-6" onClick={handleAddToCart}>
                    Add to cart ${getPrice().toFixed(2)}
                  </Button>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
