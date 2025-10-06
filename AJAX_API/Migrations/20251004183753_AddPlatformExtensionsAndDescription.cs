using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AjaxRomManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPlatformExtensionsAndDescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Platforms",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Extensions",
                table: "Platforms",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "Extensions",
                table: "Platforms");
        }
    }
}
