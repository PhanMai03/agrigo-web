import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Footer, type FooterProps } from '@/components/Footer';
import { Header, type HeaderProps } from '@/components/Header';
import { Container, type ContainerProps } from '@/components/Container';
import { useCart } from '@/features/cart/api/hooks';

export type { ContainerProps };
export { Container };

export type MainLayoutProps = {
  children: ReactNode;
  headerProps?: HeaderProps;
  footerProps?: FooterProps;
  container?: boolean;
  containerClassName?: string;
};

export function MainLayout({
  children,
  headerProps,
  footerProps,
  container = false,
  containerClassName = '',
}: MainLayoutProps) {
  const cart = useCart();
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header cartCount={cart.data?.totalItems ?? 0} {...headerProps} />
      <motion.main
        className="flex-1"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
      >
        {container ? (
          <Container className={containerClassName}>{children}</Container>
        ) : (
          children
        )}
      </motion.main>
      <Footer {...footerProps} />
    </div>
  );
}
