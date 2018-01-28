var SurfaceProblem = L.geoJson(accessibilitylabels, {filter: surfaceProblemFilter});

function surfaceProblemFilter(feature) {
    if (feature.properties.label_type === "SurfaceProblem") return true
}