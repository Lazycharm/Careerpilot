'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Palette, Type, Layout, RotateCcw } from 'lucide-react'
import type { ResumeCustomization } from '@/lib/resume/customization'

interface CustomizationPanelProps {
  customization: ResumeCustomization
  onChange: (customization: ResumeCustomization) => void
  onReset: () => void
}

export function CustomizationPanel({ customization, onChange, onReset }: CustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'fonts' | 'spacing'>('colors')

  const updateCustomization = (updates: Partial<ResumeCustomization>) => {
    onChange({ ...customization, ...updates })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Palette className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Customize Design
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={onReset}
            className="text-xs w-full sm:w-auto"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'colors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
            Colors
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'fonts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Type className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
            Fonts
          </button>
          <button
            onClick={() => setActiveTab('spacing')}
            className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'spacing'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Layout className="h-3 w-3 sm:h-4 sm:w-4 inline mr-1" />
            Spacing
          </button>
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={customization.primaryColor}
                    onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                    className="flex-1 text-xs"
                    placeholder="#667eea"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.secondaryColor}
                    onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={customization.secondaryColor}
                    onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                    className="flex-1 text-xs"
                    placeholder="#764ba2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => updateCustomization({ textColor: e.target.value })}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={customization.textColor}
                    onChange={(e) => updateCustomization({ textColor: e.target.value })}
                    className="flex-1 text-xs"
                    placeholder="#2c3e50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                    className="h-10 w-20 p-1"
                  />
                  <Input
                    type="text"
                    value={customization.backgroundColor}
                    onChange={(e) => updateCustomization({ backgroundColor: e.target.value })}
                    className="flex-1 text-xs"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fonts Tab */}
        {activeTab === 'fonts' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs">Font Family</Label>
              <select
                value={customization.fontFamily}
                onChange={(e) => updateCustomization({ fontFamily: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="'Segoe UI', 'Helvetica Neue', Arial, sans-serif">Segoe UI (Modern)</option>
                <option value="'Times New Roman', 'Georgia', serif">Times New Roman (Classic)</option>
                <option value="'Georgia', 'Times New Roman', serif">Georgia (Elegant)</option>
                <option value="'Arial', 'Helvetica', sans-serif">Arial (Clean)</option>
                <option value="'Calibri', 'Arial', sans-serif">Calibri (Professional)</option>
                <option value="'Garamond', 'Times New Roman', serif">Garamond (Traditional)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Heading Font</Label>
              <select
                value={customization.headingFont}
                onChange={(e) => updateCustomization({ headingFont: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="'Segoe UI', 'Helvetica Neue', Arial, sans-serif">Segoe UI (Modern)</option>
                <option value="'Times New Roman', 'Georgia', serif">Times New Roman (Classic)</option>
                <option value="'Georgia', 'Times New Roman', serif">Georgia (Elegant)</option>
                <option value="'Arial', 'Helvetica', sans-serif">Arial (Clean)</option>
                <option value="'Calibri', 'Arial', sans-serif">Calibri (Professional)</option>
                <option value="'Garamond', 'Times New Roman', serif">Garamond (Traditional)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Font Size: {customization.fontSize}pt</Label>
              <Input
                type="range"
                min="9"
                max="14"
                step="0.5"
                value={customization.fontSize}
                onChange={(e) => updateCustomization({ fontSize: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Line Height: {customization.lineHeight.toFixed(1)}</Label>
              <Input
                type="range"
                min="1.2"
                max="2.0"
                step="0.1"
                value={customization.lineHeight}
                onChange={(e) => updateCustomization({ lineHeight: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Spacing Tab */}
        {activeTab === 'spacing' && (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-xs">Section Spacing: {customization.sectionSpacing}px</Label>
              <Input
                type="range"
                min="10"
                max="40"
                step="2"
                value={customization.sectionSpacing}
                onChange={(e) => updateCustomization({ sectionSpacing: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Border Style</Label>
              <select
                value={customization.borderStyle}
                onChange={(e) => updateCustomization({ borderStyle: e.target.value as any })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="none">None</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Border Width: {customization.borderWidth}px</Label>
              <Input
                type="range"
                min="0"
                max="5"
                step="1"
                value={customization.borderWidth}
                onChange={(e) => updateCustomization({ borderWidth: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Border Radius: {customization.borderRadius}px</Label>
              <Input
                type="range"
                min="0"
                max="10"
                step="1"
                value={customization.borderRadius}
                onChange={(e) => updateCustomization({ borderRadius: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
