export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        <p>&copy; {year} Portfolio. All rights reserved.</p>
      </div>
    </footer>
  );
}
