-- AlterEnum: add two new SupportTicketSource values so brand-enquiry and
-- customer-support contact form submissions can be told apart in the admin
-- panel. Purely additive — no existing rows are touched.
ALTER TYPE "SupportTicketSource" ADD VALUE 'BRAND_CONTACT_MESSAGE';
ALTER TYPE "SupportTicketSource" ADD VALUE 'CUSTOMER_CONTACT_MESSAGE';
