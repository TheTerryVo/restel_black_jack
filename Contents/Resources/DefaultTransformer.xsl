<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng"
				version="1.0">

<xsl:output method="xml" encoding="UTF-8" indent="no"
	doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN"
	doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />

<!--
====================================================
DefaultTransformer.xsl for Application
====================================================
-->

<!--
====================================================
Root level template that defines the XML structure

dic-list and dic
====================================================
-->

<xsl:template match="/">
	<xsl:apply-templates />
</xsl:template>


<!--
	Add a class for detecting the current view via css, and <div> at the end to <html> element
-->
<xsl:template match="html">
	<html>
		<xsl:copy-of select="@*" />
		<xsl:attribute name="class">
		<xsl:value-of select="concat(@class, $apple_display-whichview)"/>
		</xsl:attribute>
		<xsl:apply-templates />
		<div class="entry_end" style="clear:both"></div>
	</html>
</xsl:template>

<!--
	Preserve embedded style definitions as CDATA without escaping
-->
<xsl:template match="style">
	<style>
		<xsl:attribute name="type">text/css</xsl:attribute>
		<xsl:text disable-output-escaping="yes">/*&lt;![CDATA[*/</xsl:text>
		<xsl:value-of select="." disable-output-escaping="yes" />
		<xsl:text disable-output-escaping="yes">/*]]&gt;*/</xsl:text>
	</style>
</xsl:template>

<!--
	Default rule for all other tags
-->
<xsl:template match="@*|node()">
	<xsl:copy>
		<xsl:apply-templates select="@*|node()" />
	</xsl:copy>
</xsl:template>

</xsl:stylesheet>

