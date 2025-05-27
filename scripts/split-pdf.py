#!/usr/bin/env python3
"""
PDF Splitter Tool for SiteAgent
Splits large PDFs into smaller chunks to avoid Edge Function memory limits.

Usage: python scripts/split-pdf.py input.pdf [--pages-per-chunk 10]
"""

import argparse
import sys
from pathlib import Path

try:
    from PyPDF2 import PdfReader, PdfWriter
except ImportError:
    print("Error: PyPDF2 is not installed. Install it with:")
    print("pip install PyPDF2")
    sys.exit(1)

def split_pdf(input_path: str, pages_per_chunk: int = 10):
    """Split a PDF into smaller chunks."""
    input_file = Path(input_path)
    
    if not input_file.exists():
        print(f"Error: File '{input_path}' not found.")
        return False
    
    if not input_file.suffix.lower() == '.pdf':
        print(f"Error: File '{input_path}' is not a PDF.")
        return False
    
    try:
        # Read the input PDF
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        print(f"Processing '{input_file.name}' with {total_pages} pages...")
        print(f"Splitting into chunks of {pages_per_chunk} pages each...")
        
        # Calculate number of chunks needed
        num_chunks = (total_pages + pages_per_chunk - 1) // pages_per_chunk
        
        base_name = input_file.stem
        output_dir = input_file.parent
        
        for chunk_idx in range(num_chunks):
            start_page = chunk_idx * pages_per_chunk
            end_page = min(start_page + pages_per_chunk, total_pages)
            
            # Create a new PDF writer for this chunk
            writer = PdfWriter()
            
            # Add pages to this chunk
            for page_idx in range(start_page, end_page):
                writer.add_page(reader.pages[page_idx])
            
            # Generate output filename
            chunk_filename = f"{base_name} - Part {chunk_idx + 1}.pdf"
            output_path = output_dir / chunk_filename
            
            # Write the chunk to file
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            print(f"✅ Created: {chunk_filename} (pages {start_page + 1}-{end_page})")
        
        print(f"\n🎉 Successfully split '{input_file.name}' into {num_chunks} parts!")
        print("\nNext steps:")
        print("1. Upload each part separately to your chatbot")
        print("2. The parts will be processed individually")
        print("3. Delete the original large PDF if desired")
        
        return True
        
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(
        description="Split large PDFs into smaller chunks for easier processing"
    )
    parser.add_argument("input_pdf", help="Path to the PDF file to split")
    parser.add_argument(
        "--pages-per-chunk", 
        type=int, 
        default=10, 
        help="Number of pages per chunk (default: 10)"
    )
    
    args = parser.parse_args()
    
    if not split_pdf(args.input_pdf, args.pages_per_chunk):
        sys.exit(1)

if __name__ == "__main__":
    main() 