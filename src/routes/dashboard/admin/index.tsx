import { createFileRoute, Link } from '@tanstack/react-router'
import { AdminPageHeader } from '#/components/admin/admin-page-header'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { adminNavItems } from '#/lib/admin-nav'
import { routeBreadcrumb } from '#/lib/breadcrumb'

export const Route = createFileRoute('/dashboard/admin/')({
  staticData: routeBreadcrumb('خلاصه'),
  component: AdminOverviewPage,
})

const overviewLinks = adminNavItems.filter(item => item.to !== '/dashboard/admin')

function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="پنل مدیریت"
        description="مدیریت کاربران، پرداخت‌ها و محصولات فروشگاه"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewLinks.map(item => (
          <Card key={item.to}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <item.icon className="size-5" />
                {item.title}
              </CardTitle>
              <CardDescription>
                {item.to === '/dashboard/admin/users' && 'مشاهده و تغییر نقش کاربران'}
                {item.to === '/dashboard/admin/payments' && 'مشاهده سفارش‌ها و وضعیت پرداخت'}
                {item.to === '/dashboard/admin/products' && 'افزودن، ویرایش و حذف محصولات'}
              </CardDescription>
            </CardHeader>
            <Button asChild variant="outline" className="mx-6 mb-6 w-fit">
              <Link to={item.to}>ورود</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
