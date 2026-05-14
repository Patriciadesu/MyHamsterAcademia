import re

with open('/root/MyHamsterAcademia/frontend/src/App.tsx', 'r') as f:
    content = f.read()

# Find the start of StockChart
start_str = "  const StockChart = ({ showStatus: ss"
start_idx = content.find(start_str)

# Find the end of StockChart
end_str = "  };\n\n  return (\n    <div style={{ width: '100vw'"
end_idx = content.find(end_str)

stock_chart_code = content[start_idx:end_idx + 4] # Include the "  };\n"

# Remove it from inside Main
new_content = content[:start_idx] + content[end_idx+6:]

# Insert it before function Main() {
main_start_idx = new_content.find("function Main() {")
new_content = new_content[:main_start_idx] + stock_chart_code + "\n" + new_content[main_start_idx:]

with open('/root/MyHamsterAcademia/frontend/src/App.tsx', 'w') as f:
    f.write(new_content)

print("Moved StockChart out of Main successfully.")
