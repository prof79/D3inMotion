// visualList.js
// The visualization library code for our app.

"use strict";

// This global variable is an IIFE (immediately-invoked function expression).
const visualList = (function () {

    return function (svg, props) {

        // Retrieve properties
        const data = props.data;
        const xValue = props.xValue;
        const yValue = props.yValue;
        const displayValue = props.displayValue;
        const margin = props.margin;
        const barPadding = props.barPadding;
        const verticalSpacing = props.verticalSpacing;
        const transitionDuration = props.transitionDuration;

        // Sort the data descending by price.
        data.sort(function (a, b) {
            return d3.descending(xValue(a), xValue(b));
        });

        // Define our default transition and duration.
        const transition =
        d3
            .transition()
            .duration(transitionDuration);
        
        const width = +svg.attr('width');

        const innerWidth = width - margin.left - margin.right;
        const innerHeight = verticalSpacing * data.length;
        const height = margin.top + innerHeight + margin.bottom;

        svg
            .transition(transition)
            .attr('height', height);

        const g = svg
            .selectAll('g')
            .data([null])
            .enter()
                .append('g')
            .merge(svg.select('g'))
                .attr('transform', function (d) {
                    return 'translate(' + margin.left + ' ' + margin.top + ')';
                });

        // Y (vertical axis) will be a band scale.
        const yScale = d3.scaleBand();

        // X (horizontal axis) will be a linear, price-based scale.
        const xScale = d3.scaleLinear();
        
        // We will use vertical bars for visualization.

        // X - bar width, price scaled to pixels
        xScale
            .domain([0, d3.max(data, xValue)])
            .range([0, innerWidth]);

        // Y - bar height, even portions based on number of elements.
        yScale
            .paddingInner(barPadding)
            // Outer padding must be half of inner ... but why?
            // Maybe because of number of items and resulting spacing ...
            .paddingOuter(barPadding / 2)
            .domain(data.map(yValue))
            .range([0, data.length * verticalSpacing]);

        // Create groups for all bar-text pairs.
        // This and what follows is the general update pattern.
        const subGroups =
            g
                .selectAll('g')
                // Animations are usually associated to the array index
                // of a data row. Thus we need an explicit key function
                // to make animations (transitions) work.
                .data(data, yValue);

        // Create an exit group for exit animations.
        const subGroupsExit =
            subGroups
                .exit();

        subGroupsExit
            // This is necessary to buy us some time for the bars
            // (rects) to shrink on removal.
            .transition(transition)
            .remove();

        const subGroupsEnter =
            subGroups
                .enter()
                    .append('g')
                    // This looks like a duplicate but we need initial
                    // positioning in the Enter Phase to make transitions
                    // work.
                    .attr('transform', function (d) {
                        return 'translate('
                            + 0
                            + ' '
                            + (yScale(yValue(d)))
                            + ')';
                    });

        subGroups
            .merge(subGroupsEnter)
            // Animate changes. Duration is in ms.
            // What follows the transition (transform) will be animated.
            .transition(transition)
                .attr('transform', function (d) {
                    return 'translate('
                        + 0
                        + ' '
                        + (yScale(yValue(d)))
                        + ')';
                });

        // Bars behind text data join.
        // Nested general update pattern in action.
        const bars =
            subGroupsEnter
                .append('rect')
                    .attr('fill', 'steelblue')
                    // Basis for animating the bar width from 0 to x.
                    .attr('width', 0)
                // Select what already had been there.
                // This gets the update selection of already existing
                // rect elements.
                .merge(subGroups.select('rect'))
                    .attr('height', function (d) {
                        return yScale.bandwidth();
                    })
                    .transition(transition)
                    .attr('width', function (d) {
                        return xScale(xValue(d));
                    })
                ;

        // Shrink the bar of removed items on exit.
        subGroupsExit
            .select('rect')
            .transition(transition)
            .attr('width', 0);

        // Item names.
        // Nested general update pattern in action.

        // Background text ("stroke").
        const textBackground =
            subGroupsEnter
                .append('text')
                    .attr('class', 'textBackground')
                    .attr('dx', '0.2em')
                    .attr('dy', '1.0em')
                    .attr('fill', 'none')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 5)
                    .attr('stroke-linejoin', 'round')
                // Select what already had been there.
                // This gets the update selection of already existing
                // text elements.
                .merge(subGroups.select('.textBackground'))
                    .text(displayValue)
                ;

        // Foreground text.
        const textForeground =
            subGroupsEnter
                .append('text')
                    .attr('class', 'textForeground')
                    .attr('dx', '0.2em')
                    .attr('dy', '1.0em')
                // Select what already had been there.
                // This gets the update selection of already existing
                // text elements.
                .merge(subGroups.select('.textForeground'))
                    .text(displayValue)
                ;
    };

})();
