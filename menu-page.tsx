"use client"

import { useEffect, useState } from "react"
import { getAllProducts, type ProductWithCategory } from "@/lib/product-service"
import { getCategories, type Category } from "@/lib/category-service"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function MenuPage({ initialProducts = [] }) {
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(initialProducts.length === 0)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const { categories: fetchedCategories, error: categoriesError } = await getCategories()

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
          toast({
            title: "Error",
            description: "Failed to load categories. Using fallback data.",
          })
        } else {
          setCategories(fetchedCategories)
        }

        // Only fetch products if we don't have initialProducts
        if (initialProducts.length === 0) {
          const { products: fetchedProducts, error: productsError } = await getAllProducts()

          if (productsError) {
            console.error("Error fetching products:", productsError)
            toast({
              title: "Error",
              description: "Failed to load products. Using fallback data.",
            })
          } else if (fetchedProducts && fetchedProducts.length > 0) {
            setProducts(fetchedProducts)
          } else {
            // Use fallback products if none were found
            const fallbackProducts = [
              {
                id: "1",
                name: "Espresso",
                description:
                  "Strong coffee brewed by forcing hot water under pressure through finely ground coffee beans",
                image_url: "/placeholder.svg?height=200&width=200&text=Espresso",
                category: "Coffee",
                price_min: 3.99,
                price_max: 4.99,
              },
              {
                id: "2",
                name: "Cappuccino",
                description: "Coffee drink with espresso, hot milk, and steamed milk foam",
                image_url: "/placeholder.svg?height=200&width=200&text=Cappuccino",
                category: "Coffee",
                price_min: 4.99,
                price_max: 5.99,
              },
              {
                id: "3",
                name: "Latte",
                description: "Coffee drink made with espresso and steamed milk",
                image_url: "/placeholder.svg?height=200&width=200&text=Latte",
                category: "Coffee",
                price_min: 4.99,
                price_max: 5.99,
              },
            ]
            setProducts(fallbackProducts)
          }
        }
      } catch (err) {
        console.error("Exception fetching data:", err)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Using fallback data.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [initialProducts])

  // If we have no categories yet, extract unique categories from products
  const displayCategories =
    categories.length > 0
      ? categories
      : Array.from(new Set(products.map((p) => p.category)))
          .filter(Boolean)
          .map((name) => ({ id: name, name }))

  const filteredProducts = selectedCategoryId
    ? products.filter(
        (product) =>
          product.category_id === selectedCategoryId ||
          product.categories?.id === selectedCategoryId ||
          selectedCategoryId === product.category,
      )
    : products

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Our Menu</h1>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Our Menu</h1>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={selectedCategoryId === null ? "default" : "outline"}
          onClick={() => setSelectedCategoryId(null)}
          className="capitalize"
        >
          All
        </Button>
        {displayCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategoryId === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategoryId(category.id)}
            className="capitalize"
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={
                  product.image_url || `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(product.name)}`
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{product.description}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-lg font-bold">
                  ${(product.price_min || 0).toFixed(2)}
                  {product.price_min !== product.price_max && ` - $${(product.price_max || 0).toFixed(2)}`}
                </p>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                  {product.categories?.name || product.category}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/product/${product.id}`} className="w-full">
                <Button className="w-full">View Details</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
