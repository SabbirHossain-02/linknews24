import { prisma } from "../src/prisma";
import { hashPassword } from "../src/lib/password";

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@linknews24.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin1234";
  const name = process.env.ADMIN_NAME ?? "Super Admin";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Super admin already exists:", email);
    return;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: await hashPassword(password),
      role: "SUPER_ADMIN",
    },
  });
  console.log("Created super admin:", user.email);

  // Ensure the singleton Live TV settings row exists.
  await prisma.liveTvSetting.upsert({
    where: { id: "live-tv" },
    update: {},
    create: { id: "live-tv" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
