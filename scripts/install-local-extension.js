#!/usr/bin/env node
/**
 * Pemasang VSIX lokal untuk extension Vin Code (vin-code).
 *
 * Berbeda dengan scripts/install-vsix.js yang melakukan `--uninstall-extension`
 * lebih dulu (berisiko menghapus globalStorage/riwayat chat pengguna), script ini
 * melakukan upgrade in-place memakai flag `--force` sehingga state lama tetap utuh.
 *
 * Pemakaian:
 *   node scripts/install-local-extension.js
 *   node scripts/install-local-extension.js --editor=cursor
 */

const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

// Tentukan perintah editor (default: "code"). Bisa dioverride lewat --editor=...
const editorArg = process.argv.find((arg) => arg.startsWith("--editor="))
const editorInput = editorArg ? editorArg.split("=")[1] : "code"

// Di Windows, shim `code` (tanpa ekstensi) harus dipanggil TANPA tanda kutip,
// karena cmd.exe memperlakukannya sebagai path literal dan gagal. Karena itu
// kita pilih varian .cmd saat tersedia agar resolusi konsisten.
const editor =
	process.platform === "win32" && !editorInput.toLowerCase().endsWith(".cmd") ? `${editorInput}.cmd` : editorInput

function fail(message) {
	console.error(`\n❌ ${message}`)
	process.exit(1)
}

try {
	const srcPackageJsonPath = path.join(__dirname, "..", "src", "package.json")
	const { name, version, publisher } = JSON.parse(fs.readFileSync(srcPackageJsonPath, "utf-8"))

	const vsixPath = path.join(__dirname, "..", "bin", `${name}-${version}.vsix`)
	const extensionId = `${publisher}.${name}`

	console.log("\n🚀 Pemasang extension Vin Code (hasil build lokal)")
	console.log("================================================")
	console.log(`  Extension : ${extensionId}`)
	console.log(`  Versi     : ${version}`)
	console.log(`  VSIX      : ${vsixPath}`)
	console.log(`  Editor    : ${editor}`)
	console.log(`  Metode    : upgrade in-place (--force), state lama dipertahankan`)

	if (!fs.existsSync(vsixPath)) {
		fail(`File VSIX tidak ditemukan: ${vsixPath}\n   Jalankan "pnpm vsix" terlebih dahulu.`)
	}

	console.log("\n⏳ Memasang extension...")
	// Tanpa tanda kutip pada perintah editor agar shim .cmd Windows dapat dijalankan.
	execSync(`${editor} --install-extension "${vsixPath}" --force`, { stdio: "inherit" })

	console.log("\n✅ Berhasil dipasang.")
	console.log("⚠️  Muat ulang VS Code agar versi baru aktif:")
	console.log('    Command Palette → "Developer: Reload Window"\n')
} catch (error) {
	fail(error && error.message ? error.message : String(error))
}
