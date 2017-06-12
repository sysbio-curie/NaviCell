/*
  public void paint(Graphics g) {
        Graphics2D g2 = (Graphics2D) g;
        Color color1 = Color.RED;
        Color color2 = Color.BLUE;
        int steps = 30;
        int rectWidth = 10;
        int rectHeight = 10;

        for (int i = 0; i < steps; i++) {
            float ratio = (float) i / (float) steps;
            int red = (int) (color2.getRed() * ratio + color1.getRed() * (1 - ratio));
            int green = (int) (color2.getGreen() * ratio + color1.getGreen() * (1 - ratio));
            int blue = (int) (color2.getBlue() * ratio + color1.getBlue() * (1 - ratio));
            Color stepColor = new Color(red, green, blue);
            Rectangle2D rect2D = new Rectangle2D.Float(rectWidth * i, 0, rectWidth, rectHeight);
            g2.setPaint(stepColor);
            g2.fill(rect2D);
        }
    }
*/

function RGBColor(red, green, blue) {
	this.red = red;
	this.green = green;
	this.blue = blue;
}

RGBColor.prototype = {
	setRGB: function(red, green, blue) {
		this.red = red;
		this.green = green;
		this.blue = blue;
	},

	getRed: function() {
		return red;
	},

	getGreen: function() {
		return green;
	},

	getBlue: function() {
		return blue;
	}
};

function color_gradient(color1, color2, steps) {
	step *= 1.;
	var gradients = [];
        for (ii = 0; ii < steps; ii++) {
		var ratio = ii/steps;
		var red = color2.getRed() * ratio + color1.getRed() * (1 - ratio);
		var green = color2.getGreen() * ratio + color1.getGreen() * (1 - ratio);
		var blue = color2.getBlue() * ratio + color1.getBlue() * (1 - ratio);
		gradients.push(new RGBColor(red, green, blue));
	}
	return gradients;
}
