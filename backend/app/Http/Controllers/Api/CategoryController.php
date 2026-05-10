<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Cycle;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Cycle $cycle)
    {
        return response()->json($cycle->categories);
    }

    public function store(Request $request, Cycle $cycle)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:150',
            'description' => 'nullable|string',
            'criteria'    => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $category = $cycle->categories()->create($data);

        return response()->json($category, 201);
    }

    public function update(Request $request, Cycle $cycle, Category $category)
    {
        $data = $request->validate([
            'name'        => 'sometimes|string|max:150',
            'description' => 'nullable|string',
            'criteria'    => 'nullable|string',
            'sort_order'  => 'nullable|integer|min:0',
        ]);

        $category->update($data);

        return response()->json($category);
    }

    public function destroy(Cycle $cycle, Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Category removed.']);
    }
}
