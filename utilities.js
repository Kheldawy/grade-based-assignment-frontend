export function mapRawCocktailData(rawCocktail) {
    return {
      id: rawCocktail.idDrink,
      name: rawCocktail.strDrink,
      tags: rawCocktail.strTags ? rawCocktail.strTags.split(',') : [],
      category: rawCocktail.strCategory,
      glass: rawCocktail.strGlass,
      instructions: rawCocktail.strInstructions,
      thumbnail: rawCocktail.strDrinkThumb,
      ingredients: Array.from({ length: 15 })
        .map((_, i) => ({
          ingredient: rawCocktail[`strIngredient${i + 1}`],
          measure: rawCocktail[`strMeasure${i + 1}`],
        }))
        .filter(item => item.ingredient),
    };
  }
  