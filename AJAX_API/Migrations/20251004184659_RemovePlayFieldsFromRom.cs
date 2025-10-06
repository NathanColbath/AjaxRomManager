using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AjaxRomManager.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemovePlayFieldsFromRom : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LastPlayed",
                table: "Roms");

            migrationBuilder.DropColumn(
                name: "PlayCount",
                table: "Roms");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LastPlayed",
                table: "Roms",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlayCount",
                table: "Roms",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
