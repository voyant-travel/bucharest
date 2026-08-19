/**
 * Where an enquiry goes, decided once for the whole page.
 *
 * This page carries a call to action roughly every screen and a half, because
 * nothing on it can be booked online — the enquiry is the only conversion it
 * has. That density is only safe if every one of those buttons is known to
 * lead somewhere: a page with eight dead links reads as broken far faster than
 * a page with none reads as unhelpful. So the target is resolved once, at the
 * top, and a block that receives nothing renders no button at all.
 *
 * The caller's `enquiryHref` wins over the destination's own, because the
 * caller knows the site's enquiry route and the content only knows what an
 * operator happened to type into a settings field.
 */
import { telHref } from "~/lib/site"

export function enquiryTarget(
  fromCaller: string | undefined,
  fromContent: string | undefined,
  phone: string | undefined,
): string | undefined {
  return fromCaller ?? fromContent ?? (phone ? telHref(phone) : undefined)
}
