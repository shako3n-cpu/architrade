import { Link } from 'react-router-dom'
import { Eyebrow } from '@/components/ui/eyebrow'

type FooterLink = { to: string; label: string }

/**
 * One titled column of links in the footer. Used for both "Quick links" and
 * "Categories" so the two stay visually identical.
 */
export function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <Eyebrow as="p" className="mb-6 text-ink">
        {title}
      </Eyebrow>

      <ul className="flex flex-col gap-3.5">
        {links.map((link) => (
          <li key={`${link.to}-${link.label}`}>
            <Link
              to={link.to}
              className="text-sm text-muted transition-colors duration-300 hover:text-brass"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
